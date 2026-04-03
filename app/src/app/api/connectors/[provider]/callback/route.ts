import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const TOKEN_URLS: Record<string, string> = {
  youtube: "https://oauth2.googleapis.com/token",
  spotify: "https://accounts.spotify.com/api/token",
  instagram: "https://api.instagram.com/oauth/access_token",
  x: "https://api.twitter.com/2/oauth2/token",
};

const CLIENT_ENV: Record<string, { id: string; secret: string }> = {
  youtube: { id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET" },
  spotify: { id: "SPOTIFY_CLIENT_ID", secret: "SPOTIFY_CLIENT_SECRET" },
  instagram: { id: "INSTAGRAM_CLIENT_ID", secret: "INSTAGRAM_CLIENT_SECRET" },
  x: { id: "X_CLIENT_ID", secret: "X_CLIENT_SECRET" },
};

function encryptToken(token: string): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) return token;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/settings/connectors`;

  if (error || !code || !state) {
    return NextResponse.redirect(`${settingsUrl}?error=auth_failed`);
  }

  // Decode state
  let stateData: { userId: string; provider: string };
  try {
    stateData = JSON.parse(
      Buffer.from(state, "base64url").toString("utf8")
    );
  } catch {
    return NextResponse.redirect(`${settingsUrl}?error=invalid_state`);
  }

  if (stateData.provider !== provider) {
    return NextResponse.redirect(`${settingsUrl}?error=provider_mismatch`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateData.userId) {
    return NextResponse.redirect(`${settingsUrl}?error=unauthorized`);
  }

  // Retrieve code_verifier from audit
  const { data: auditRecords } = await supabase
    .from("audit_events")
    .select("metadata")
    .eq("user_id", user.id)
    .eq("action", "oauth_initiated")
    .order("created_at", { ascending: false })
    .limit(1);

  const codeVerifier = auditRecords?.[0]?.metadata?.code_verifier as string;

  // Exchange code for tokens
  const envKeys = CLIENT_ENV[provider];
  const tokenUrl = TOKEN_URLS[provider];
  if (!envKeys || !tokenUrl) {
    return NextResponse.redirect(`${settingsUrl}?error=unsupported`);
  }

  const clientId = process.env[envKeys.id]!;
  const clientSecret = process.env[envKeys.secret]!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/connectors/${provider}/callback`;

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
  }

  const tokens = await tokenRes.json();

  // Get connector record
  const { data: connector } = await supabase
    .from("external_connectors")
    .select("id")
    .eq("provider", provider)
    .single();

  if (!connector) {
    return NextResponse.redirect(`${settingsUrl}?error=connector_not_found`);
  }

  // Save connection with encrypted tokens
  const thirtyDaysFromNow = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabase.from("user_external_connections").upsert(
    {
      user_id: user.id,
      connector_id: connector.id,
      status: "connected" as const,
      oauth_token_encrypted: encryptToken(tokens.access_token),
      oauth_refresh_token_encrypted: tokens.refresh_token
        ? encryptToken(tokens.refresh_token)
        : null,
      oauth_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      next_sync_at: thirtyDaysFromNow,
    },
    { onConflict: "user_id,connector_id" }
  );

  // Record GDPR consent
  await supabase.from("data_processing_consent").upsert(
    {
      user_id: user.id,
      connector_id: connector.id,
      purpose: "matching_enhancement",
      status: "granted" as const,
      consent_text: `I consent to PRAGMA accessing my ${provider} data to derive personality and preference signals for matching improvement. Only derived signals are stored; raw data is never persisted.`,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "user_id,connector_id,purpose" }
  );

  // Trigger analysis
  await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/connectors/analyze`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, provider }),
    }
  ).catch(() => {
    // Non-blocking — analysis can happen async
  });

  // Audit
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "oauth_completed",
    entity_type: "external_connectors",
    metadata: { provider },
  });

  return NextResponse.redirect(`${settingsUrl}?connected=${provider}`);
}
