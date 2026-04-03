"use server";

import { createClient } from "@/lib/supabase/server";
import { funnelSchemas } from "@/lib/validation/funnel-schemas";
import type { FunnelSide } from "@/types/database";
import type { FunnelLevel } from "@/types/funnel";
import { MANDATORY_LEVELS } from "@/types/funnel";

interface SaveResult {
  success: boolean;
  error?: string;
}

export async function saveFunnelLevel(
  level: FunnelLevel,
  side: FunnelSide,
  data: Record<string, unknown>,
  weighting?: Record<string, string>,
  tolerance?: Record<string, string>,
  dealBreakers?: string[]
): Promise<SaveResult> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate schema
  const schema = funnelSchemas[level];
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  // Check sequential unlock: Level N requires Level N-1 to be complete (both sides)
  if (level > 1) {
    const { data: prevLevels } = await supabase
      .from("funnel_profiles")
      .select("side, completed")
      .eq("user_id", user.id)
      .eq("level", level - 1);

    const prevSelfComplete = prevLevels?.find(
      (l) => l.side === "self"
    )?.completed;
    const prevTargetComplete = prevLevels?.find(
      (l) => l.side === "target"
    )?.completed;

    if (!prevSelfComplete || !prevTargetComplete) {
      return {
        success: false,
        error: `Complete Level ${level - 1} (both sides) first`,
      };
    }
  }

  // Determine if completed
  const isMandatoryLevel = MANDATORY_LEVELS.includes(level);
  const isCompleted = isMandatoryLevel ? parsed.success : true;

  // Upsert funnel profile
  const { error: upsertError } = await supabase.from("funnel_profiles")
    .upsert(
      {
        user_id: user.id,
        level,
        side,
        data: parsed.data,
        weighting: side === "target" ? weighting ?? null : null,
        tolerance: side === "target" ? tolerance ?? null : null,
        deal_breakers: side === "target" ? dealBreakers ?? null : null,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,level,side" }
    );

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  // Update active funnel level in profile
  if (isCompleted) {
    const { data: allLevels } = await supabase
      .from("funnel_profiles")
      .select("level, side, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

    // Find the highest level where both sides are complete
    let maxComplete = 0;
    for (let l = 1; l <= 5; l++) {
      const selfDone = allLevels?.find(
        (r) => r.level === l && r.side === "self"
      )?.completed;
      const targetDone = allLevels?.find(
        (r) => r.level === l && r.side === "target"
      )?.completed;
      if (selfDone && targetDone) {
        maxComplete = l;
      } else {
        break;
      }
    }

    const nextLevel = Math.min(maxComplete + 1, 5);

    await supabase.from("profiles")
      .update({
        active_funnel_level: nextLevel,
        quality_score: computeQualityScore(allLevels || []),
      })
      .eq("user_id", user.id);
  }

  // Audit log
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "funnel_profile_saved",
    entity_type: "funnel_profiles",
    entity_id: `${level}-${side}`,
    metadata: { level, side, completed: isCompleted },
  });

  return { success: true };
}

interface FunnelProgressLevel {
  level: number;
  side: string;
  completed: boolean;
  data: Record<string, unknown>;
}

interface FunnelProgressProfile {
  active_funnel_level: number;
  quality_score: number;
}

export interface FunnelProgress {
  levels: FunnelProgressLevel[];
  profile: FunnelProgressProfile | null;
}

export async function getFunnelProgress(): Promise<FunnelProgress | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: levels } = await supabase
    .from("funnel_profiles")
    .select("level, side, completed, data")
    .eq("user_id", user.id)
    .order("level");

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_funnel_level, quality_score")
    .eq("user_id", user.id)
    .single();

  return {
    levels: (levels || []) as FunnelProgressLevel[],
    profile: profile as FunnelProgressProfile | null,
  };
}

function computeQualityScore(
  levels: { level: number; side: string; completed: boolean }[]
): number {
  // Quality score: mandatory levels (L1-L3) = 60%, optional (L4-L5) = 40%
  let score = 0;
  const mandatoryWeight = 20; // 20% per mandatory level (3 levels = 60%)
  const optionalWeight = 20; // 20% per optional level (2 levels = 40%)

  for (let l = 1; l <= 3; l++) {
    const selfDone = levels.find(
      (r) => r.level === l && r.side === "self" && r.completed
    );
    const targetDone = levels.find(
      (r) => r.level === l && r.side === "target" && r.completed
    );
    if (selfDone) score += mandatoryWeight / 2;
    if (targetDone) score += mandatoryWeight / 2;
  }

  for (let l = 4; l <= 5; l++) {
    const selfDone = levels.find(
      (r) => r.level === l && r.side === "self" && r.completed
    );
    const targetDone = levels.find(
      (r) => r.level === l && r.side === "target" && r.completed
    );
    if (selfDone) score += optionalWeight / 2;
    if (targetDone) score += optionalWeight / 2;
  }

  return Math.round(score);
}
