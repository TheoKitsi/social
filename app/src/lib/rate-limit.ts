/**
 * In-memory sliding window rate limiter.
 *
 * For Vercel serverless this provides per-instance protection.
 * For stronger guarantees swap the store to Upstash Redis:
 *   import { Ratelimit } from "@upstash/ratelimit";
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to avoid memory leaks (every 60s)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Maximum requests within the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    return {
      success: false,
      remaining: 0,
      reset: oldestInWindow + config.windowMs,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.limit - entry.timestamps.length,
    reset: now + config.windowMs,
  };
}

/**
 * Extract a rate-limit key from a request.
 * Uses user ID if available (from header set by middleware), else IP.
 */
export function getRateLimitKey(
  request: Request,
  prefix: string
): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}

/**
 * Apply rate limiting and return a 429 Response if exceeded, or null if OK.
 */
export function applyRateLimit(
  request: Request,
  prefix: string,
  config: RateLimitConfig
): Response | null {
  const key = getRateLimitKey(request, prefix);
  const result = rateLimit(key, config);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(
            Math.ceil((result.reset - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
        },
      }
    );
  }

  return null;
}
