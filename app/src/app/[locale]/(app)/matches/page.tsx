"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, ProgressBar, Badge } from "@/components/ui";
import { expressInterest, declineMatch } from "@/app/actions/consent";
import { ReportDialog } from "@/components/report-dialog";

interface Match {
  candidateId: string;
  displayName: string | null;
  avatarUrl: string | null;
  compositeScore: number;
  scoreToCandidate: number;
  scoreFromCandidate: number;
  strengths: string[];
  differences: string[];
  consentStatus?: "pending" | "accepted" | "declined" | null;
}

export default function MatchesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState("");
  const [mutualMatch, setMutualMatch] = useState<string | null>(null);
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialLoadDone = useRef(false);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("matching_scores")
      .select("*")
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .order("composite_score", { ascending: false })
      .limit(10);

    if (data) {
      // Collect candidate IDs to fetch profiles
      const candidateIds = data.map((m: Record<string, unknown>) =>
        m.user_a_id === user.id ? m.user_b_id : m.user_a_id
      );

      // Fetch candidate profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", candidateIds);

      const profileMap = new Map(
        (profiles || []).map((p: Record<string, unknown>) => [p.user_id, p])
      );

      setMatches(
        data.map((m: Record<string, unknown>) => {
          const candidateId =
            m.user_a_id === user.id
              ? (m.user_b_id as string)
              : (m.user_a_id as string);
          const candidateProfile = profileMap.get(candidateId) as Record<string, unknown> | undefined;
          return {
            candidateId,
            displayName: (candidateProfile?.display_name as string) || null,
            avatarUrl: (candidateProfile?.avatar_url as string) || null,
            compositeScore: m.composite_score as number,
            scoreToCandidate:
              m.user_a_id === user.id
                ? (m.score_a_to_b as number)
                : (m.score_b_to_a as number),
            scoreFromCandidate:
              m.user_a_id === user.id
                ? (m.score_b_to_a as number)
                : (m.score_a_to_b as number),
            strengths: ((m.breakdown as Record<string, unknown>)?.strengths as string[]) || [],
            differences: ((m.breakdown as Record<string, unknown>)?.differences as string[]) || [],
          };
        })
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    // Use startTransition to avoid set-state-in-effect lint error
    startTransition(() => { loadMatches(); });
  }, [loadMatches, startTransition]);

  async function handleCompute() {
    setComputing(true);
    setError("");

    const res = await fetch("/api/matching/compute", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to compute matches");
    } else {
      setMatches(data.matches || []);
    }
    setComputing(false);
  }

  function handleInterest(candidateId: string) {
    startTransition(async () => {
      const result = await expressInterest(candidateId);
      if (result.success) {
        setMatches((prev) =>
          prev.map((m) =>
            m.candidateId === candidateId
              ? { ...m, consentStatus: result.mutual ? "accepted" : "pending" }
              : m
          )
        );
        if (result.mutual) {
          setMutualMatch(candidateId);
        }
      } else {
        setError(result.error || "Failed to express interest");
      }
    });
  }

  function handleDecline(candidateId: string) {
    startTransition(async () => {
      const result = await declineMatch(candidateId);
      if (result.success) {
        setMatches((prev) =>
          prev.map((m) =>
            m.candidateId === candidateId
              ? { ...m, consentStatus: "declined" }
              : m
          )
        );
      } else {
        setError(result.error || "Failed to decline");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">
          {t("nav.matches")}
        </h1>
        <Button onClick={handleCompute} loading={computing} size="sm">
          {t("matching.findNew")}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {matches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 space-y-4">
            <svg
              className="mx-auto w-16 h-16 text-on-surface-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <p className="text-on-surface-muted">{t("matching.noMatches")}</p>
            <Button onClick={handleCompute} loading={computing}>
              {t("matching.findNew")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match, i) => (
            <Card key={match.candidateId} variant="elevated" className="animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` } as React.CSSProperties}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* Profile avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-primary/15 text-primary border border-primary/20 font-bold text-lg">
                    {match.avatarUrl ? (
                      <img src={match.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-on-surface">
                      {match.displayName || `Match #${i + 1}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          match.compositeScore >= 80
                            ? "success"
                            : match.compositeScore >= 60
                              ? "primary"
                              : "warning"
                        }
                      >
                        {match.compositeScore}%
                      </Badge>
                      <span className="text-xs text-on-surface-muted">
                        {t("matching.compositeScore")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setReportingUserId(match.candidateId)}
                    className="p-2 text-on-surface-muted hover:text-error transition-colors shrink-0"
                    title={t("report.title")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                </div>

                {/* Score breakdown (FN-9.1.1.2) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-on-surface-muted mb-1">
                      {t("matching.yourFit")}
                    </p>
                    <ProgressBar
                      value={match.scoreToCandidate}
                      size="sm"
                      showPercent
                    />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-muted mb-1">
                      {t("matching.theirFit")}
                    </p>
                    <ProgressBar
                      value={match.scoreFromCandidate}
                      size="sm"
                      showPercent
                    />
                  </div>
                </div>

                {/* Strengths & Differences */}
                {match.strengths.length > 0 && (
                  <div>
                    <p className="text-xs text-on-surface-muted mb-1">
                      {t("matching.strengths")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.strengths.map((s) => (
                        <Badge key={s} variant="success" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {match.differences.length > 0 && (
                  <div>
                    <p className="text-xs text-on-surface-muted mb-1">
                      {t("matching.differences")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.differences.map((d) => (
                        <Badge key={d} variant="warning" size="sm">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions — Consent interest (FN-5.1.1.1) */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  {match.consentStatus === "accepted" ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push("/messages")}
                    >
                      {t("consent.startChat")}
                    </Button>
                  ) : match.consentStatus === "pending" ? (
                    <Button size="sm" className="flex-1" disabled>
                      {t("consent.interestSent")}
                    </Button>
                  ) : match.consentStatus === "declined" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled
                    >
                      {t("consent.declined")}
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleInterest(match.candidateId)}
                        loading={isPending}
                      >
                        {t("consent.expressInterest")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDecline(match.candidateId)}
                        loading={isPending}
                      >
                        {t("consent.decline")}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mutual match celebration modal */}
      {mutualMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-sm w-full shadow-[var(--shadow-accent-lg)] animate-fade-in-up">
            <CardContent className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-on-surface">
                {t("consent.mutualMatchTitle")}
              </h2>
              <p className="text-on-surface-muted text-sm">
                {t("consent.mutualMatchDesc")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setMutualMatch(null)}
                >
                  {t("common.close")}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setMutualMatch(null);
                    router.push("/messages");
                  }}
                >
                  {t("consent.startChat")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportingUserId && (
        <ReportDialog
          reportedUserId={reportingUserId}
          onClose={() => setReportingUserId(null)}
        />
      )}
    </div>
  );
}
