"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 10;

export default function VerifyIdentityPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError("");

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError("Please upload a JPEG, PNG, WebP, or PDF file");
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be smaller than ${MAX_SIZE_MB} MB`);
      return;
    }

    setFile(selected);

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setUploading(false);
      return;
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/id-document-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("verification-docs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    // Create verification request
    await supabase.from("verification_requests").insert({
      user_id: user.id,
      type: "id_document",
      status: "pending",
      document_path: filePath,
    });

    // Audit log
    await supabase.from("audit_events").insert({
      user_id: user.id,
      action: "id_document_uploaded",
      entity_type: "verification_requests",
      metadata: { filePath },
    });

    setUploading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md px-6 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-warning/15 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          {t("verificationPending")}
        </h1>
        <p className="text-on-surface-muted">
          Your ID document has been submitted for review. This usually takes 24-48 hours.
        </p>
        <Button onClick={() => router.push("/onboarding")} className="w-full">
          {t("login").replace("Sign In", "Continue to Profile")}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          {t("verifyId")}
        </h1>
        <p className="text-sm text-on-surface-muted">
          {t("verifyIdDescription")}
        </p>
      </div>

      <Card variant="outlined">
        <CardContent className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-12 border-2 border-dashed border-border rounded-xl hover:border-primary transition-colors flex flex-col items-center gap-3"
            >
              <svg
                className="w-10 h-10 text-on-surface-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-sm text-on-surface-muted">
                {t("uploadId")}
              </span>
              <span className="text-xs text-on-surface-muted">
                JPEG, PNG, WebP, PDF &mdash; max {MAX_SIZE_MB} MB
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              {preview && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="ID preview"
                    className="w-full h-48 object-cover blur-sm"
                  />
                  <div className="absolute inset-0 bg-surface/60 flex items-center justify-center">
                    <span className="text-xs text-on-surface-muted bg-surface/80 px-3 py-1 rounded-full">
                      Preview blurred for security
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-on-surface-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-sm text-error hover:underline shrink-0 ml-3"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button
        onClick={handleUpload}
        loading={uploading}
        disabled={!file}
        className="w-full"
      >
        {t("uploadId")}
      </Button>

      <button
        type="button"
        onClick={() => router.push("/onboarding")}
        className="w-full text-sm text-on-surface-muted hover:underline"
      >
        Skip for now
      </button>
    </div>
  );
}
