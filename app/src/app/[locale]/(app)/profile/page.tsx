"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, ProgressBar, Badge } from "@/components/ui";
import { getFunnelProgress } from "@/app/actions/funnel";

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [progress, setProgress] = useState<{
    levels: { level: number; side: string; completed: boolean }[];
    profile: { active_funnel_level: number; quality_score: number } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(prof);

      const prog = await getFunnelProgress();
      setProgress(prog);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const qualityScore = progress?.profile?.quality_score || 0;
  const activeFunnelLevel = progress?.profile?.active_funnel_level || 1;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">
        {t("nav.profile")}
      </h1>

      {/* Quality Score */}
      <Card variant="elevated" className="animate-fade-in-up">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-on-surface tracking-[var(--tracking-normal)]">
              {t("profile.qualityScore")}
            </h2>
            <Badge
              variant={
                qualityScore >= 80
                  ? "success"
                  : qualityScore >= 50
                    ? "primary"
                    : "warning"
              }
            >
              {qualityScore}%
            </Badge>
          </div>
          <ProgressBar value={qualityScore} showPercent />
          <p className="text-sm text-on-surface-muted">
            {qualityScore < 100 && t("profile.completeMoreLevels")}
          </p>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card variant="outlined">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-on-surface">
            {t("verification.title")}
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("verification.email")}</span>
              <Badge variant={profile?.email_verified ? "success" : "warning"}>
                {profile?.email_verified
                  ? t("verification.verified")
                  : t("verification.pending")}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("verification.phone")}</span>
              <Badge variant={profile?.phone_verified ? "success" : "warning"}>
                {profile?.phone_verified
                  ? t("verification.verified")
                  : t("verification.pending")}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t("verification.identity")}</span>
              <Badge
                variant={
                  profile?.id_verified ? "success" : "warning"
                }
              >
                {profile?.id_verified
                  ? t("verification.verified")
                  : t("verification.pending")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funnel Progress */}
      <Card variant="outlined">
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-on-surface">
            {t("funnel.title")}
          </h2>
          {[1, 2, 3, 4, 5].map((level) => {
            const selfDone = progress?.levels.find(
              (l) => l.level === level && l.side === "self" && l.completed
            );
            const targetDone = progress?.levels.find(
              (l) => l.level === level && l.side === "target" && l.completed
            );
            const isActive = level === activeFunnelLevel;
            const isLocked = level > activeFunnelLevel;

            return (
              <div
                key={level}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isActive
                    ? "bg-primary/10 border border-primary/30"
                    : isLocked
                      ? "opacity-50"
                      : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selfDone && targetDone
                      ? "bg-success text-white"
                      : isActive
                        ? "bg-primary text-on-primary"
                        : "bg-surface-alt text-on-surface-muted"
                  }`}
                >
                  {selfDone && targetDone ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    level
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">
                    {t(`funnel.levels.${level}.title`)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      size="sm"
                      variant={selfDone ? "success" : "default"}
                    >
                      {t("funnel.selfDescription")}{" "}
                      {selfDone ? "done" : "-"}
                    </Badge>
                    <Badge
                      size="sm"
                      variant={targetDone ? "success" : "default"}
                    >
                      {t("funnel.targetPerson")}{" "}
                      {targetDone ? "done" : "-"}
                    </Badge>
                  </div>
                </div>
                {isActive && !isLocked && (
                  <Button
                    size="sm"
                    onClick={() => router.push("/onboarding")}
                  >
                    {t("common.continue")}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
