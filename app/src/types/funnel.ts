import type { Weighting, Tolerance } from "./database";

/** Funnel level numbers */
export type FunnelLevel = 1 | 2 | 3 | 4 | 5;

/** Which levels are mandatory vs optional */
export const MANDATORY_LEVELS: FunnelLevel[] = [1, 2, 3];
export const OPTIONAL_LEVELS: FunnelLevel[] = [4, 5];

// ── Level 1: Foundation ──────────────────────────────────────────────

export interface FunnelLevel1 {
  age: number;
  gender: string;
  location: string;
  relationshipIntention: string;
  coreValues: string[];
  sexualOrientation: string;
  languages: string[];
}

// ── Level 2: Character & Lifestyle ───────────────────────────────────

export interface FunnelLevel2 {
  personalityType: string;
  introversionExtraversion: number; // 1-10 slider
  communicationStyle: string;
  dailyRoutine: string;
  diet: string;
  smokingAlcoholDrugs: {
    smoking: string;
    alcohol: string;
    drugs: string;
  };
  pets: string;
  religionSpirituality: string;
  politicalOrientation: string;
}

// ── Level 3: Future & Goals ──────────────────────────────────────────

export interface FunnelLevel3 {
  desireForChildren: string;
  childrenTimeline: string;
  careerAmbitions: string;
  incomeSituation: string;
  housingGoal: string;
  willingnessToRelocate: string;
  educationalBackground: string;
  familyVision: string;
  retirementAttitude: string;
}

// ── Level 4: Depth ───────────────────────────────────────────────────

export interface FunnelLevel4 {
  hobbiesDetailed: string;
  sportsFitness: string;
  travelPreferences: string;
  musicTaste: string;
  sexualPreferences: string;
  quirks: string;
  unconventionalLifeModels: string;
  specialFamilyBonds: string;
  fearsPhobias: string;
}

// ── Level 5: Fine-Tuning ─────────────────────────────────────────────

export interface FunnelLevel5 {
  foodPreferences: string;
  sleepHabits: string;
  tidinessChaos: string;
  socialMediaUsage: string;
  mediaConsumption: string;
  culturalTraditions: string;
  holidays: string;
  humorType: string;
  conflictResolutionStyle: string;
}

/** Union type for any funnel level data */
export type FunnelLevelData =
  | FunnelLevel1
  | FunnelLevel2
  | FunnelLevel3
  | FunnelLevel4
  | FunnelLevel5;

/** Target person field with weighting metadata */
export interface TargetFieldMeta {
  weighting: Weighting;
  tolerance: Tolerance;
  isDealBreaker: boolean;
}

/** Target profile = same fields as self + weighting metadata per field */
export type TargetProfile<T> = {
  [K in keyof T]: {
    value: T[K];
    meta: TargetFieldMeta;
  };
};

/** Funnel level configuration */
export interface FunnelLevelConfig {
  level: FunnelLevel;
  mandatory: boolean;
  matchingWeight: number; // 0-1, how heavily this level factors into matching
}

/** Default funnel level weights (configurable per ADR-1) */
export const FUNNEL_LEVEL_WEIGHTS: FunnelLevelConfig[] = [
  { level: 1, mandatory: true, matchingWeight: 0.27 },
  { level: 2, mandatory: true, matchingWeight: 0.23 },
  { level: 3, mandatory: true, matchingWeight: 0.23 },
  { level: 4, mandatory: false, matchingWeight: 0.10 },
  { level: 5, mandatory: false, matchingWeight: 0.07 },
];
