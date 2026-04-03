import type { Weighting, Tolerance } from "@/types/database";
import type { ExternalSignals } from "@/types/connectors";

interface MatchInput {
  userId: string;
  selfProfiles: Map<number, Record<string, unknown>>;
  targetProfiles: Map<
    number,
    {
      data: Record<string, unknown>;
      weighting: Record<string, Weighting>;
      tolerance: Record<string, Tolerance>;
      dealBreakers: string[];
    }
  >;
  qualityScore: number;
  externalInsights?: ExternalSignals | null;
}

interface MatchBreakdown {
  levelScores: Record<number, number>;
  dealBreakersMet: boolean;
  strengths: string[];
  differences: string[];
}

interface MatchResult {
  userAId: string;
  userBId: string;
  scoreAtoB: number;
  scoreBtoA: number;
  compositeScore: number;
  breakdown: MatchBreakdown;
}

/** Level weights — L1-L5 funnel + L6 adaptive external insights */
const LEVEL_WEIGHTS: Record<number, number> = {
  1: 0.27,
  2: 0.23,
  3: 0.23,
  4: 0.10,
  5: 0.07,
  6: 0.10,
};

/** Original weights when L6 is not available (both-or-neither fairness rule) */
const LEVEL_WEIGHTS_NO_L6: Record<number, number> = {
  1: 0.30,
  2: 0.25,
  3: 0.25,
  4: 0.12,
  5: 0.08,
};

/** Minimum composite score to generate a proposal (FN-3.1.1.7) */
const DEFAULT_MIN_SCORE = 60;

/**
 * Computes bidirectional matching score between two users.
 * FN-3.1.1.1: Both directions must reach minimum score.
 */
export function computeMatch(
  userA: MatchInput,
  userB: MatchInput,
  minScore: number = DEFAULT_MIN_SCORE
): MatchResult | null {
  // Both-or-neither fairness: L6 only when BOTH users have external data
  const useL6 = !!(userA.externalInsights && userB.externalInsights);

  const scoreAtoB = computeDirectionalScore(userA, userB, useL6);
  const scoreBtoA = computeDirectionalScore(userB, userA, useL6);

  // Both directions must meet minimum
  if (!scoreAtoB.dealBreakersMet || !scoreBtoA.dealBreakersMet) {
    return null;
  }

  const weights = useL6 ? LEVEL_WEIGHTS : LEVEL_WEIGHTS_NO_L6;
  const compositeA = computeWeightedTotal(scoreAtoB.levelScores, weights);
  const compositeB = computeWeightedTotal(scoreBtoA.levelScores, weights);

  // Quality bonus: higher quality profiles get slight boost (FN-3.2.1.3)
  const qualityBonusA = (userA.qualityScore / 100) * 5; // max 5% bonus
  const qualityBonusB = (userB.qualityScore / 100) * 5;

  const finalA = Math.min(100, compositeA + qualityBonusA);
  const finalB = Math.min(100, compositeB + qualityBonusB);
  const composite = (finalA + finalB) / 2;

  if (finalA < minScore || finalB < minScore) {
    return null;
  }

  return {
    userAId: userA.userId,
    userBId: userB.userId,
    scoreAtoB: Math.round(finalA * 100) / 100,
    scoreBtoA: Math.round(finalB * 100) / 100,
    compositeScore: Math.round(composite * 100) / 100,
    breakdown: {
      levelScores: scoreAtoB.levelScores,
      dealBreakersMet: true,
      strengths: [...scoreAtoB.strengths, ...scoreBtoA.strengths],
      differences: [...scoreAtoB.differences, ...scoreBtoA.differences],
    },
  };
}

/**
 * Computes directional score: How well does userB's self-profile
 * match userA's target profile?
 */
function computeDirectionalScore(
  seeker: MatchInput,
  candidate: MatchInput,
  useL6: boolean = false
): MatchBreakdown {
  const levelScores: Record<number, number> = {};
  const strengths: string[] = [];
  const differences: string[] = [];

  for (let level = 1; level <= 5; level++) {
    const targetProfile = seeker.targetProfiles.get(level);
    const selfProfile = candidate.selfProfiles.get(level);

    if (!targetProfile || !selfProfile) {
      levelScores[level] = 0;
      continue;
    }

    // FN-3.1.1.4: Deal-breaker knockout filter
    for (const field of targetProfile.dealBreakers) {
      const targetValue = targetProfile.data[field];
      const candidateValue = selfProfile[field];

      if (targetValue !== undefined && candidateValue !== undefined) {
        if (!valuesMatch(targetValue, candidateValue, "exact")) {
          return {
            levelScores: {},
            dealBreakersMet: false,
            strengths: [],
            differences: [`Deal-breaker: ${field}`],
          };
        }
      }
    }

    // Score each field in this level
    let fieldScoreSum = 0;
    let fieldWeightSum = 0;

    for (const [field, targetValue] of Object.entries(targetProfile.data)) {
      const candidateValue = selfProfile[field];
      if (candidateValue === undefined) continue;

      // FN-3.1.1.3: Field weighting — Must-Have > Nice-to-Have > Indifferent
      const weight = getFieldWeight(targetProfile.weighting[field]);
      if (weight === 0) continue; // Indifferent = excluded from matching

      const toleranceType = targetProfile.tolerance[field] || "flexible";
      const match = valuesMatch(targetValue, candidateValue, toleranceType);
      const fieldScore = match ? 100 : partialMatch(targetValue, candidateValue);

      fieldScoreSum += fieldScore * weight;
      fieldWeightSum += weight;

      if (fieldScore >= 80) {
        strengths.push(field);
      } else if (fieldScore < 40) {
        differences.push(field);
      }
    }

    levelScores[level] =
      fieldWeightSum > 0 ? fieldScoreSum / fieldWeightSum : 0;
  }

  // L6: Adaptive external insights comparison
  if (useL6 && seeker.externalInsights && candidate.externalInsights) {
    levelScores[6] = computeInsightSimilarity(
      seeker.externalInsights,
      candidate.externalInsights
    );
  }

  return {
    levelScores,
    dealBreakersMet: true,
    strengths: strengths.slice(0, 5),
    differences: differences.slice(0, 5),
  };
}

function computeWeightedTotal(
  levelScores: Record<number, number>,
  weights: Record<number, number> = LEVEL_WEIGHTS
): number {
  let total = 0;
  let weightSum = 0;

  for (const [level, score] of Object.entries(levelScores)) {
    const weight = weights[Number(level)] || 0;
    total += score * weight;
    weightSum += weight;
  }

  return weightSum > 0 ? total / weightSum * 100 : 0;
}

function getFieldWeight(weighting: Weighting | undefined): number {
  switch (weighting) {
    case "must_have":
      return 3;
    case "nice_to_have":
      return 1;
    case "indifferent":
      return 0;
    default:
      return 1;
  }
}

function valuesMatch(
  target: unknown,
  candidate: unknown,
  tolerance: Tolerance | string
): boolean {
  if (target === candidate) return true;

  if (Array.isArray(target) && Array.isArray(candidate)) {
    return target.some((v) => candidate.includes(v));
  }

  if (typeof target === "string" && typeof candidate === "string") {
    if (tolerance === "exact") return target === candidate;
    if (tolerance === "flexible") return true; // Any value is acceptable
    // "range" — for strings, check inclusion
    return (
      candidate.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(candidate.toLowerCase())
    );
  }

  if (typeof target === "number" && typeof candidate === "number") {
    if (tolerance === "exact") return target === candidate;
    if (tolerance === "flexible") return true;
    // "range" — within 20% tolerance
    const diff = Math.abs(target - candidate);
    return diff <= Math.abs(target) * 0.2;
  }

  return false;
}

function partialMatch(target: unknown, candidate: unknown): number {
  if (typeof target === "string" && typeof candidate === "string") {
    // Simple Jaccard similarity on word tokens
    const aWords = new Set(target.toLowerCase().split(/\s+/));
    const bWords = new Set(candidate.toLowerCase().split(/\s+/));
    const intersection = [...aWords].filter((w) => bWords.has(w)).length;
    const union = new Set([...aWords, ...bWords]).size;
    return union > 0 ? (intersection / union) * 100 : 0;
  }

  if (Array.isArray(target) && Array.isArray(candidate)) {
    const intersection = target.filter((v) => candidate.includes(v)).length;
    const union = new Set([...target, ...candidate]).size;
    return union > 0 ? (intersection / union) * 100 : 0;
  }

  return 0;
}

/**
 * Computes similarity between two users' external insight signals (L6).
 * Uses Jaccard similarity for array fields and proximity for numeric fields.
 * Returns 0-100 score.
 */
function computeInsightSimilarity(a: ExternalSignals, b: ExternalSignals): number {
  let scoreSum = 0;
  let weightCount = 0;

  // Array fields — Jaccard similarity
  const arrayFields: (keyof ExternalSignals)[] = [
    "interests",
    "genre_affinity",
    "values",
    "lifestyle_indicators",
    "aesthetic_sense",
    "mood_patterns",
  ];

  for (const field of arrayFields) {
    const aArr = a[field] as string[] | undefined;
    const bArr = b[field] as string[] | undefined;
    if (aArr?.length && bArr?.length) {
      const aSet = new Set(aArr.map((s) => s.toLowerCase()));
      const bSet = new Set(bArr.map((s) => s.toLowerCase()));
      const inter = [...aSet].filter((x) => bSet.has(x)).length;
      const union = new Set([...aSet, ...bSet]).size;
      scoreSum += union > 0 ? (inter / union) * 100 : 0;
      weightCount++;
    }
  }

  // Numeric fields — proximity (1 - absolute difference) * 100
  const numericFields: (keyof ExternalSignals)[] = [
    "curiosity_score",
    "cultural_openness",
    "openness_to_experience",
    "conscientiousness",
  ];

  for (const field of numericFields) {
    const aVal = a[field] as number | undefined;
    const bVal = b[field] as number | undefined;
    if (aVal != null && bVal != null) {
      scoreSum += (1 - Math.abs(aVal - bVal)) * 100;
      weightCount++;
    }
  }

  // Categorical fields — exact match = 100, else 0
  const catFields: (keyof ExternalSignals)[] = [
    "content_depth",
    "communication_style",
    "intellectual_depth",
    "humor_style",
    "social_energy",
  ];

  for (const field of catFields) {
    const aVal = a[field] as string | undefined;
    const bVal = b[field] as string | undefined;
    if (aVal && bVal) {
      scoreSum += aVal === bVal ? 100 : 30; // Same = 100, different = partial credit
      weightCount++;
    }
  }

  return weightCount > 0 ? scoreSum / weightCount : 0;
}
