import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/matching/engine";
import { applyRateLimit } from "@/lib/rate-limit";
import type { Weighting, Tolerance } from "@/types/database";
import type { ExternalSignals } from "@/types/connectors";

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, "matching-compute", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check L1-L3 both sides complete (FN-3.1.1.6)
  const { data: userLevels } = await supabase
    .from("funnel_profiles")
    .select("level, side, data, weighting, tolerance, deal_breakers, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  const mandatoryComplete = [1, 2, 3].every((level) => {
    const selfDone = userLevels?.find(
      (l) => l.level === level && l.side === "self"
    );
    const targetDone = userLevels?.find(
      (l) => l.level === level && l.side === "target"
    );
    return selfDone && targetDone;
  });

  if (!mandatoryComplete) {
    return NextResponse.json(
      { error: "Complete funnel levels L1-L3 first" },
      { status: 400 }
    );
  }

  // Get user profile for quality score
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("quality_score")
    .eq("user_id", user.id)
    .single();

  // Build current user's match input
  const userInput = buildMatchInput(
    user.id,
    userLevels || [],
    userProfile?.quality_score || 0
  );

  // Load external insights for current user (L6 adaptive matching)
  const { data: userInsights } = await supabase
    .from("external_insights")
    .select("signals")
    .eq("user_id", user.id)
    .gte("expires_at", new Date().toISOString());

  if (userInsights?.length) {
    userInput.externalInsights = mergeInsightSignals(
      userInsights.map((i) => i.signals as ExternalSignals)
    );
  }

  // Get pool of candidates (verified, active, L1-L3 complete) (FN-1.1.1.5)
  const { data: candidates } = await supabase
    .from("profiles")
    .select("user_id, quality_score, email_verified, phone_verified")
    .neq("user_id", user.id)
    .eq("email_verified", true)
    .eq("active_funnel_level", 4) // At least L3 complete → active_funnel_level bumped to 4
    .gte("active_funnel_level", 4);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Filter out blocked/declined users (FN-5.1.2.4)
  const { data: declinedRecords } = await supabase
    .from("consent_records")
    .select("from_user_id, to_user_id")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .eq("status", "declined");

  const blockedIds = new Set<string>();
  for (const r of declinedRecords || []) {
    blockedIds.add(r.from_user_id === user.id ? r.to_user_id : r.from_user_id);
  }

  const filteredCandidates = candidates.filter((c) => !blockedIds.has(c.user_id));
  if (filteredCandidates.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Fetch all candidate funnel profiles in batch
  const candidateIds = filteredCandidates.map((c) => c.user_id);
  const { data: candidateLevels } = await supabase
    .from("funnel_profiles")
    .select(
      "user_id, level, side, data, weighting, tolerance, deal_breakers, completed"
    )
    .in("user_id", candidateIds)
    .eq("completed", true);

  // Load external insights for all candidates (batch)
  const { data: allCandidateInsights } = await supabase
    .from("external_insights")
    .select("user_id, signals")
    .in("user_id", candidateIds)
    .gte("expires_at", new Date().toISOString());

  // Group insights by user
  const candidateInsightsMap = new Map<string, ExternalSignals[]>();
  for (const ci of allCandidateInsights || []) {
    const existing = candidateInsightsMap.get(ci.user_id) || [];
    existing.push(ci.signals as ExternalSignals);
    candidateInsightsMap.set(ci.user_id, existing);
  }

  // Group by user
  const candidateMap = new Map<string, typeof candidateLevels>();
  for (const cl of candidateLevels || []) {
    const existing = candidateMap.get(cl.user_id) || [];
    existing.push(cl);
    candidateMap.set(cl.user_id, existing);
  }

  // Compute matches
  const results = [];

  for (const candidate of filteredCandidates) {
    const cLevels = candidateMap.get(candidate.user_id);
    if (!cLevels) continue;

    const candidateInput = buildMatchInput(
      candidate.user_id,
      cLevels,
      candidate.quality_score || 0
    );

    // Attach external insights if available
    const cInsights = candidateInsightsMap.get(candidate.user_id);
    if (cInsights?.length) {
      candidateInput.externalInsights = mergeInsightSignals(cInsights);
    }

    const match = computeMatch(userInput, candidateInput);
    if (match) {
      results.push(match);
    }
  }

  // Sort by composite score descending
  results.sort((a, b) => b.compositeScore - a.compositeScore);

  // Store top matches (FN-11.1.1.1 — contingent limit handled separately)
  for (const match of results.slice(0, 10)) {
    await supabase.from("matching_scores").upsert(
      {
        user_a_id: match.userAId,
        user_b_id: match.userBId,
        score_a_to_b: match.scoreAtoB,
        score_b_to_a: match.scoreBtoA,
        composite_score: match.compositeScore,
        breakdown: match.breakdown,
        algorithm_version: "2.0.0",
        computed_at: new Date().toISOString(),
      },
      { onConflict: "user_a_id,user_b_id" }
    );
  }

  // Audit
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "matching_computed",
    entity_type: "matching_scores",
    metadata: { candidateCount: filteredCandidates.length, matchCount: results.length },
  });

  return NextResponse.json({
    matches: results.slice(0, 10).map((m) => ({
      candidateId: m.userBId,
      compositeScore: m.compositeScore,
      scoreToCandidate: m.scoreAtoB,
      scoreFromCandidate: m.scoreBtoA,
      strengths: m.breakdown.strengths,
      differences: m.breakdown.differences,
    })),
  });
}

function buildMatchInput(
  userId: string,
  levels: {
    level: number;
    side: string;
    data: unknown;
    weighting: unknown;
    tolerance: unknown;
    deal_breakers: unknown;
    completed: boolean;
  }[],
  qualityScore: number
) {
  const selfProfiles = new Map<number, Record<string, unknown>>();
  const targetProfiles = new Map<
    number,
    {
      data: Record<string, unknown>;
      weighting: Record<string, Weighting>;
      tolerance: Record<string, Tolerance>;
      dealBreakers: string[];
    }
  >();

  for (const l of levels) {
    if (l.side === "self") {
      selfProfiles.set(l.level, l.data as Record<string, unknown>);
    } else {
      targetProfiles.set(l.level, {
        data: (l.data as Record<string, unknown>) || {},
        weighting: (l.weighting as Record<string, Weighting>) || {},
        tolerance: (l.tolerance as Record<string, Tolerance>) || {},
        dealBreakers: (l.deal_breakers as string[]) || [],
      });
    }
  }

  return { userId, selfProfiles, targetProfiles, qualityScore, externalInsights: null as ExternalSignals | null };
}

/** Merge multiple insight records into one combined signal set */
function mergeInsightSignals(insights: ExternalSignals[]): ExternalSignals {
  const merged: ExternalSignals = {};
  const allInterests = new Set<string>();
  const allValues = new Set<string>();
  const allGenres = new Set<string>();
  const allLifestyle = new Set<string>();
  const numericAccum: Record<string, number[]> = {};

  for (const s of insights) {
    if (s.interests) s.interests.forEach((i) => allInterests.add(i));
    if (s.values) s.values.forEach((v) => allValues.add(v));
    if (s.genre_affinity) s.genre_affinity.forEach((g) => allGenres.add(g));
    if (s.lifestyle_indicators) s.lifestyle_indicators.forEach((l) => allLifestyle.add(l));

    for (const field of ["curiosity_score", "cultural_openness", "openness_to_experience", "conscientiousness"] as const) {
      if (s[field] != null) {
        if (!numericAccum[field]) numericAccum[field] = [];
        numericAccum[field].push(s[field] as number);
      }
    }

    // Take first non-null categorical value
    if (s.communication_style && !merged.communication_style) merged.communication_style = s.communication_style;
    if (s.content_depth && !merged.content_depth) merged.content_depth = s.content_depth;
    if (s.intellectual_depth && !merged.intellectual_depth) merged.intellectual_depth = s.intellectual_depth;
    if (s.humor_style && !merged.humor_style) merged.humor_style = s.humor_style;
    if (s.social_energy && !merged.social_energy) merged.social_energy = s.social_energy;
  }

  if (allInterests.size) merged.interests = [...allInterests];
  if (allValues.size) merged.values = [...allValues];
  if (allGenres.size) merged.genre_affinity = [...allGenres];
  if (allLifestyle.size) merged.lifestyle_indicators = [...allLifestyle];

  for (const [field, values] of Object.entries(numericAccum)) {
    (merged as Record<string, unknown>)[field] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  return merged;
}
