"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

const REPORT_REASONS = [
  "fake_profile",
  "harassment",
  "inappropriate_content",
  "spam",
  "underage",
  "scam",
  "other",
] as const;

interface ReportDialogProps {
  reportedUserId: string;
  onClose: () => void;
}

export function ReportDialog({ reportedUserId, onClose }: ReportDialogProps) {
  const t = useTranslations("report");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(t("notLoggedIn"));
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("user_reports").insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason,
      description: description.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(t("submitError"));
      return;
    }

    setSubmitted(true);
  }

  async function handleBlock() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_blocks").insert({
      blocker_id: user.id,
      blocked_user_id: reportedUserId,
    });
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full text-center space-y-4 animate-fade-in-up">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-500/15 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-400"
            >
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-on-surface font-medium">{t("submitted")}</p>
          <p className="text-sm text-on-surface-muted">{t("submittedDescription")}</p>
          <Button onClick={onClose} variant="outline" size="sm">
            {t("close")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full space-y-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface">{t("title")}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-alt flex items-center justify-center transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-on-surface-muted"
            >
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-on-surface-muted">{t("description")}</p>

        {/* Reason selection */}
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors border ${
                reason === r
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface-alt/50 text-on-surface-muted hover:border-on-surface-muted/30"
              }`}
            >
              {t(`reasons.${r}`)}
            </button>
          ))}
        </div>

        {/* Optional description */}
        {reason === "other" && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("detailsPlaceholder")}
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-alt border border-border text-on-surface placeholder:text-on-surface-muted/50 resize-none h-20 focus:outline-none focus:border-primary transition-colors"
          />
        )}

        {error && (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => {
              handleBlock();
              handleSubmit();
            }}
            variant="danger"
            size="sm"
            disabled={!reason || submitting}
            className="flex-1"
          >
            {submitting ? t("submitting") : t("reportAndBlock")}
          </Button>
          <Button onClick={onClose} variant="ghost" size="sm">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
