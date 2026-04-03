import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractSignals } from "@/lib/connectors/signal-extractor";
import { parseProviderData } from "@/lib/connectors/parsers";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider, connectionId, fileContent, fileName } = body;

  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }

  // Find the connection
  let connId = connectionId;
  if (!connId) {
    const { data: connector } = await supabase
      .from("external_connectors")
      .select("id")
      .eq("provider", provider)
      .single();

    if (!connector) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    const { data: connection } = await supabase
      .from("user_external_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("connector_id", connector.id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "No connection found" }, { status: 404 });
    }

    connId = connection.id;
  }

  // Update status to analyzing
  await supabase
    .from("user_external_connections")
    .update({ status: "analyzing" as const })
    .eq("id", connId);

  try {
    let rawContent: string;

    if (fileContent) {
      // File upload — content is base64 encoded
      const isZip = fileName?.endsWith(".zip");
      if (isZip) {
        rawContent = parseProviderData(provider, fileContent, fileName);
      } else {
        const decoded = Buffer.from(fileContent, "base64").toString("utf-8");
        rawContent = parseProviderData(provider, decoded, fileName);
      }
    } else {
      // OAuth — fetch data from provider API
      rawContent = await fetchOAuthData(supabase, user.id, provider, connId);
    }

    if (!rawContent || rawContent.trim().length < 50) {
      throw new Error("Insufficient data for analysis");
    }

    // AI signal extraction — raw data is in-memory only, never persisted
    const { signals, confidence } = await extractSignals(provider, rawContent);

    // Store ONLY derived signals
    const thirtyDaysFromNow = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    await supabase.from("external_insights").upsert(
      {
        user_id: user.id,
        connection_id: connId,
        provider,
        signals,
        confidence,
        analyzed_at: new Date().toISOString(),
        expires_at: thirtyDaysFromNow,
        algorithm_version: "1.0",
      },
      { onConflict: "connection_id" }
    );

    // Update connection to active + schedule next sync
    const nextSyncDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    await supabase
      .from("user_external_connections")
      .update({
        status: "active" as const,
        last_synced_at: new Date().toISOString(),
        next_sync_at: nextSyncDate,
        error_message: null,
      })
      .eq("id", connId);

    // Audit
    await supabase.from("audit_events").insert({
      user_id: user.id,
      action: "signals_extracted",
      entity_type: "external_insights",
      metadata: {
        provider,
        confidence,
        signalCount: Object.keys(signals).length,
      },
    });

    return NextResponse.json({ success: true, signals, confidence });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis failed";

    await supabase
      .from("user_external_connections")
      .update({
        status: "error" as const,
        error_message: message,
      })
      .eq("id", connId);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Fetch data from OAuth-connected provider APIs.
 * Data is processed in-memory and NEVER stored.
 */
async function fetchOAuthData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  provider: string,
  connectionId: string
): Promise<string> {
  const { data: connection } = await supabase
    .from("user_external_connections")
    .select("oauth_token_encrypted")
    .eq("id", connectionId)
    .eq("user_id", userId)
    .single();

  if (!connection?.oauth_token_encrypted) {
    throw new Error("No OAuth token found");
  }

  // In production, decrypt the token here
  const token = connection.oauth_token_encrypted;

  const endpoints: Record<string, string[]> = {
    youtube: [
      "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50",
      "https://www.googleapis.com/youtube/v3/activities?part=snippet&mine=true&maxResults=50",
    ],
    spotify: [
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term",
      "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term",
    ],
    instagram: [
      "https://graph.instagram.com/me/media?fields=caption,media_type,timestamp&limit=100",
    ],
    x: [
      "https://api.twitter.com/2/users/me/tweets?max_results=100&tweet.fields=text,created_at",
    ],
  };

  const urls = endpoints[provider];
  if (!urls) {
    throw new Error(`No API endpoints configured for ${provider}`);
  }

  const results = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return "";
      return res.text();
    })
  );

  return results.filter(Boolean).join("\n\n---\n\n");
}
