import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_TYPES: Record<string, string[]> = {
  netflix: [".csv"],
  amazon: [".csv"],
  ebay: [".csv"],
  chatgpt: [".zip"],
  claude: [".zip"],
  google_takeout: [".zip"],
};

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, "connectors-upload", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const provider = formData.get("provider") as string | null;
  const connectionId = formData.get("connectionId") as string | null;

  if (!file || !provider || !connectionId) {
    return NextResponse.json(
      { error: "Missing file, provider, or connectionId" },
      { status: 400 }
    );
  }

  // Validate provider
  const allowedExts = ALLOWED_TYPES[provider];
  if (!allowedExts) {
    return NextResponse.json(
      { error: "Provider does not support file upload" },
      { status: 400 }
    );
  }

  // Validate file extension
  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedExts.some((ext) => fileName.endsWith(ext));
  if (!hasValidExt) {
    return NextResponse.json(
      { error: `Invalid file type. Accepted: ${allowedExts.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum: 50 MB" },
      { status: 400 }
    );
  }

  // Validate MIME type (defense in depth)
  const validMimes = [
    "text/csv",
    "application/csv",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ];
  if (!validMimes.includes(file.type) && file.type !== "") {
    return NextResponse.json(
      { error: "Invalid file type" },
      { status: 400 }
    );
  }

  // Verify connection belongs to user
  const { data: connection } = await supabase
    .from("user_external_connections")
    .select("id, connector_id")
    .eq("id", connectionId)
    .eq("user_id", user.id)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  // Update status to analyzing
  await supabase
    .from("user_external_connections")
    .update({ status: "analyzing" as const })
    .eq("id", connectionId);

  // Read file content in memory (NEVER stored to disk/DB)
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Trigger analysis
  try {
    const analyzeRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/connectors/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          provider,
          connectionId,
          // Pass file content as base64 for in-memory processing
          fileContent: fileBuffer.toString("base64"),
          fileName: file.name,
        }),
      }
    );

    if (!analyzeRes.ok) {
      throw new Error("Analysis failed");
    }

    const result = await analyzeRes.json();

    // Audit
    await supabase.from("audit_events").insert({
      user_id: user.id,
      action: "file_uploaded_and_analyzed",
      entity_type: "external_connectors",
      metadata: {
        provider,
        fileName: file.name,
        fileSize: file.size,
        signalCount: Object.keys(result.signals || {}).length,
      },
    });

    return NextResponse.json({ success: true, signals: result.signals });
  } catch {
    await supabase
      .from("user_external_connections")
      .update({
        status: "error" as const,
        error_message: "Analysis failed. Please try again.",
      })
      .eq("id", connectionId);

    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
