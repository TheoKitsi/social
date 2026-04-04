import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyRateLimit } from "@/lib/rate-limit";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, "avatar-upload", { limit: 10, windowMs: 60_000 });
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

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum 5 MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${user.id}/avatar.${ext}`;

  // Remove old avatar if exists
  const { data: existing } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (existing && existing.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(existing.map((f) => `${user.id}/${f.name}`));
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Remove avatar files
  const { data: existing } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (existing && existing.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(existing.map((f) => `${user.id}/${f.name}`));
  }

  // Clear avatar_url
  await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
