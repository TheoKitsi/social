import { z } from "zod";

// ── Level 1: Foundation (Mandatory) ──────────────────────────────────

export const level1Schema = z.object({
  age: z.number().int().min(18, "Must be at least 18").max(120),
  gender: z.string().min(1, "Required"),
  location: z.string().min(2, "Required"),
  relationshipIntention: z.string().min(1, "Required"),
  coreValues: z.array(z.string()).min(1, "Select at least one").max(10),
  sexualOrientation: z.string().min(1, "Required"),
  languages: z.array(z.string()).min(1, "Select at least one"),
});

// ── Level 2: Character & Lifestyle (Mandatory) ──────────────────────

export const level2Schema = z.object({
  personalityType: z.string().min(1, "Required"),
  introversionExtraversion: z.number().min(1).max(10),
  communicationStyle: z.string().min(1, "Required"),
  dailyRoutine: z.string().min(1, "Required"),
  diet: z.string().min(1, "Required"),
  smokingAlcoholDrugs: z.object({
    smoking: z.string().min(1, "Required"),
    alcohol: z.string().min(1, "Required"),
    drugs: z.string().min(1, "Required"),
  }),
  pets: z.string().min(1, "Required"),
  religionSpirituality: z.string().min(1, "Required"),
  politicalOrientation: z.string().min(1, "Required"),
});

// ── Level 3: Future & Goals (Mandatory) ──────────────────────────────

export const level3Schema = z.object({
  desireForChildren: z.string().min(1, "Required"),
  childrenTimeline: z.string().min(1, "Required"),
  careerAmbitions: z.string().min(1, "Required"),
  incomeSituation: z.string().min(1, "Required"),
  housingGoal: z.string().min(1, "Required"),
  willingnessToRelocate: z.string().min(1, "Required"),
  educationalBackground: z.string().min(1, "Required"),
  familyVision: z.string().min(1, "Required"),
  retirementAttitude: z.string().min(1, "Required"),
});

// ── Level 4: Depth (Optional) ────────────────────────────────────────

export const level4Schema = z.object({
  hobbiesDetailed: z.string().optional().default(""),
  sportsFitness: z.string().optional().default(""),
  travelPreferences: z.string().optional().default(""),
  musicTaste: z.string().optional().default(""),
  sexualPreferences: z.string().optional().default(""),
  quirks: z.string().optional().default(""),
  unconventionalLifeModels: z.string().optional().default(""),
  specialFamilyBonds: z.string().optional().default(""),
  fearsPhobias: z.string().optional().default(""),
});

// ── Level 5: Fine-Tuning (Optional) ─────────────────────────────────

export const level5Schema = z.object({
  foodPreferences: z.string().optional().default(""),
  sleepHabits: z.string().optional().default(""),
  tidinessChaos: z.string().optional().default(""),
  socialMediaUsage: z.string().optional().default(""),
  mediaConsumption: z.string().optional().default(""),
  culturalTraditions: z.string().optional().default(""),
  holidays: z.string().optional().default(""),
  humorType: z.string().optional().default(""),
  conflictResolutionStyle: z.string().optional().default(""),
});

// ── Schema map by level ──────────────────────────────────────────────

export const funnelSchemas = {
  1: level1Schema,
  2: level2Schema,
  3: level3Schema,
  4: level4Schema,
  5: level5Schema,
} as const;

export type FunnelSchemaMap = typeof funnelSchemas;

// ── Field options (for dropdowns/selects) ───────────────────────────

export const fieldOptions = {
  gender: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non_binary", label: "Non-Binary" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ],
  relationshipIntention: [
    { value: "long_term_partner", label: "Long-term partner" },
    { value: "marriage", label: "Marriage" },
    { value: "life_partner", label: "Life partner" },
    { value: "open_to_see", label: "Open to see what develops" },
  ],
  coreValues: [
    "honesty", "loyalty", "family", "independence", "ambition",
    "compassion", "humor", "spirituality", "creativity", "stability",
    "adventure", "education", "health", "equality", "tradition",
  ],
  sexualOrientation: [
    { value: "heterosexual", label: "Heterosexual" },
    { value: "homosexual", label: "Homosexual" },
    { value: "bisexual", label: "Bisexual" },
    { value: "pansexual", label: "Pansexual" },
    { value: "asexual", label: "Asexual" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ],
  languages: [
    "German", "English", "Greek", "French", "Spanish", "Italian",
    "Turkish", "Arabic", "Portuguese", "Russian", "Chinese",
    "Japanese", "Korean", "Hindi", "Polish", "Dutch",
  ],
  personalityType: [
    { value: "analytical", label: "Analytical" },
    { value: "driver", label: "Driver" },
    { value: "amiable", label: "Amiable" },
    { value: "expressive", label: "Expressive" },
  ],
  communicationStyle: [
    { value: "direct", label: "Direct & open" },
    { value: "diplomatic", label: "Diplomatic & careful" },
    { value: "reserved", label: "Reserved" },
    { value: "emotional", label: "Emotional & expressive" },
  ],
  dailyRoutine: [
    { value: "early_bird", label: "Early bird" },
    { value: "night_owl", label: "Night owl" },
    { value: "flexible", label: "Flexible" },
  ],
  diet: [
    { value: "omnivore", label: "Omnivore" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "pescatarian", label: "Pescatarian" },
    { value: "halal", label: "Halal" },
    { value: "kosher", label: "Kosher" },
    { value: "other", label: "Other" },
  ],
  substanceUse: [
    { value: "never", label: "Never" },
    { value: "rarely", label: "Rarely" },
    { value: "socially", label: "Socially" },
    { value: "regularly", label: "Regularly" },
  ],
  pets: [
    { value: "have_dogs", label: "I have dogs" },
    { value: "have_cats", label: "I have cats" },
    { value: "have_other", label: "I have other pets" },
    { value: "want_pets", label: "I want pets" },
    { value: "no_pets", label: "No pets" },
    { value: "allergic", label: "Allergic to pets" },
  ],
  religionSpirituality: [
    { value: "christian", label: "Christian" },
    { value: "muslim", label: "Muslim" },
    { value: "jewish", label: "Jewish" },
    { value: "hindu", label: "Hindu" },
    { value: "buddhist", label: "Buddhist" },
    { value: "spiritual", label: "Spiritual, not religious" },
    { value: "agnostic", label: "Agnostic" },
    { value: "atheist", label: "Atheist" },
    { value: "other", label: "Other" },
  ],
  politicalOrientation: [
    { value: "liberal", label: "Liberal" },
    { value: "moderate", label: "Moderate" },
    { value: "conservative", label: "Conservative" },
    { value: "apolitical", label: "Apolitical" },
    { value: "other", label: "Other" },
  ],
  desireForChildren: [
    { value: "definitely_yes", label: "Definitely yes" },
    { value: "probably_yes", label: "Probably yes" },
    { value: "open", label: "Open to it" },
    { value: "probably_no", label: "Probably no" },
    { value: "definitely_no", label: "Definitely no" },
    { value: "already_have", label: "Already have children" },
  ],
  childrenTimeline: [
    { value: "within_1_year", label: "Within 1 year" },
    { value: "1_3_years", label: "1-3 years" },
    { value: "3_5_years", label: "3-5 years" },
    { value: "5_plus_years", label: "5+ years" },
    { value: "not_sure", label: "Not sure yet" },
  ],
  incomeSituation: [
    { value: "student", label: "Student" },
    { value: "entry_level", label: "Entry level" },
    { value: "mid_level", label: "Mid level" },
    { value: "senior_level", label: "Senior level" },
    { value: "self_employed", label: "Self-employed" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ],
  housingGoal: [
    { value: "renting_city", label: "Renting in the city" },
    { value: "renting_suburb", label: "Renting in the suburbs" },
    { value: "own_apartment", label: "Own apartment" },
    { value: "own_house", label: "Own house" },
    { value: "countryside", label: "Countryside" },
    { value: "flexible", label: "Flexible" },
  ],
  willingnessToRelocate: [
    { value: "yes", label: "Yes" },
    { value: "within_radius", label: "Only within a radius" },
    { value: "same_country", label: "Same country only" },
    { value: "no", label: "No" },
  ],
  educationalBackground: [
    { value: "high_school", label: "High school" },
    { value: "vocational", label: "Vocational training" },
    { value: "bachelors", label: "Bachelor's degree" },
    { value: "masters", label: "Master's degree" },
    { value: "doctorate", label: "Doctorate" },
    { value: "other", label: "Other" },
  ],
} as const;
