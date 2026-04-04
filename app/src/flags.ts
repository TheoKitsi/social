import { flag } from "flags/next";
import { get } from "@vercel/edge-config";

/**
 * Helper: resolve a flag from Edge Config, falling back to a default.
 * In local dev (no Edge Config), always returns the default.
 */
async function fromEdgeConfig<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await get<T>(key);
    return value ?? defaultValue;
  } catch {
    // Edge Config not configured (local dev) — use default
    return defaultValue;
  }
}

// ─── Feature Flags ──────────────────────────────────────────────────────────

/** Show AI-assisted onboarding modes (chat + voice) */
export const aiOnboarding = flag<boolean>({
  key: "ai-onboarding",
  description: "Enable AI-assisted onboarding (chat & voice modes)",
  defaultValue: true,
  async decide() {
    return fromEdgeConfig("ai-onboarding", true);
  },
});

/** Enable social login (Google + Apple) */
export const socialLogin = flag<boolean>({
  key: "social-login",
  description: "Show Google & Apple sign-in buttons",
  defaultValue: true,
  async decide() {
    return fromEdgeConfig("social-login", true);
  },
});

/** Show premium subscription plans */
export const showPlans = flag<boolean>({
  key: "show-plans",
  description: "Show subscription/pricing page",
  defaultValue: false,
  async decide() {
    return fromEdgeConfig("show-plans", false);
  },
});

/** Enable data connectors (Spotify, Instagram, etc.) */
export const dataConnectors = flag<boolean>({
  key: "data-connectors",
  description: "Enable data connector integrations",
  defaultValue: false,
  async decide() {
    return fromEdgeConfig("data-connectors", false);
  },
});

/** Match transparency: show why users matched */
export const matchTransparency = flag<boolean>({
  key: "match-transparency",
  description: "Show match transparency breakdown (CMP-9.1.1)",
  defaultValue: false,
  async decide() {
    return fromEdgeConfig("match-transparency", false);
  },
});

/** New message email notifications */
export const messageEmailNotifications = flag<boolean>({
  key: "message-email-notifications",
  description: "Send email when a new message is received",
  defaultValue: false,
  async decide() {
    return fromEdgeConfig("message-email-notifications", false);
  },
});

/** Personality test module (CMP-10.1.1) */
export const personalityTest = flag<boolean>({
  key: "personality-test",
  description: "Enable personality test in onboarding",
  defaultValue: false,
  async decide() {
    return fromEdgeConfig("personality-test", false);
  },
});

// ─── A/B Test Variants ──────────────────────────────────────────────────────

/** Onboarding CTA text variant */
export const onboardingCtaVariant = flag<"start" | "discover" | "begin">({
  key: "onboarding-cta-variant",
  description: "A/B test: onboarding CTA button text",
  defaultValue: "start",
  async decide() {
    // Simple random assignment for now
    const variants = ["start", "discover", "begin"] as const;
    const stored = await fromEdgeConfig<string | null>("onboarding-cta-variant", null);
    if (stored && variants.includes(stored as typeof variants[number])) {
      return stored as typeof variants[number];
    }
    return variants[Math.floor(Math.random() * variants.length)];
  },
});
