import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { applyRateLimit } from "@/lib/rate-limit";

// OAuth configurations per provider
const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
}> = {
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  spotify: {
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    scopes: ["user-top-read", "user-read-recently-played"],
    clientIdEnv: "SPOTIFY_CLIENT_ID",
    clientSecretEnv: "SPOTIFY_CLIENT_SECRET",
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["user_profile", "user_media"],
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
  },
  x: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "users.read"],
    clientIdEnv: "X_CLIENT_ID",
    clientSecretEnv: "X_CLIENT_SECRET",
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const limited = applyRateLimit(_request, "connectors-auth", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const { provider } = await params;
  const config = OAUTH_CONFIGS[provider];

  if (!config) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    return NextResponse.json(
      { error: "Provider not configured" },
      { status: 503 }
    );
  }

  // PKCE: generate code_verifier and code_challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // State includes user ID + CSRF token
  const statePayload = JSON.stringify({
    userId: user.id,
    provider,
    csrf: crypto.randomBytes(16).toString("hex"),
  });
  const state = Buffer.from(statePayload).toString("base64url");

  // Store PKCE verifier in a short-lived record
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "oauth_initiated",
    entity_type: "external_connectors",
    metadata: {
      provider,
      code_verifier: codeVerifier,
      state,
    },
  });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/connectors/${provider}/callback`;

  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
