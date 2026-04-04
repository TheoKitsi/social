"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Card, CardContent, Input, Select, ProgressBar } from "@/components/ui";
import { saveFunnelLevel, getFunnelProgress } from "@/app/actions/funnel";
import { fieldOptions } from "@/lib/validation/funnel-schemas";
import { ModeSelector, type OnboardingMode } from "@/components/onboarding/mode-selector";
import { ChatOnboarding } from "@/components/onboarding/chat-onboarding";
import { VoiceOnboarding } from "@/components/onboarding/voice-onboarding";
import type { FunnelLevel } from "@/types/funnel";
import type { FunnelSide } from "@/types/database";
import { useFlags } from "@/components/flags-provider";

/** Reflection question i18n keys per level (FN-8.1.1.3) */
const reflectionKeys: Record<number, string[]> = {
  1: ["onboarding.reflection.l1q1", "onboarding.reflection.l1q2"],
  2: ["onboarding.reflection.l2q1", "onboarding.reflection.l2q2"],
  3: ["onboarding.reflection.l3q1", "onboarding.reflection.l3q2"],
  4: ["onboarding.reflection.l4q1"],
  5: ["onboarding.reflection.l5q1"],
};

/** Field context i18n key prefix (FN-8.1.1.4) */
const fieldContextKeys = [
  "age", "gender", "location", "relationshipIntention", "coreValues",
  "sexualOrientation", "languages", "personalityType", "introversionExtraversion",
  "communicationStyle", "dailyRoutine", "diet", "smokingAlcoholDrugs",
  "religionSpirituality", "desireForChildren", "careerAmbitions",
  "incomeSituation", "willingnessToRelocate",
];

interface OnboardingStep {
  level: FunnelLevel;
  side: FunnelSide;
  fieldIndex: number;
}

export default function OnboardingPage() {
  const t = useTranslations();
  const router = useRouter();
  const { aiOnboarding } = useFlags();
  const [mode, setMode] = useState<OnboardingMode | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>({
    level: 1,
    side: "self",
    fieldIndex: 0,
  });
  const [formData, setFormData] = useState<Record<string, Record<string, Record<string, unknown>>>>({});
  const [showReflection, setShowReflection] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const DRAFT_KEY = "pragma-onboarding-draft";
  const STEP_KEY = "pragma-onboarding-step";

  // Persist formData to localStorage on every change
  const persistDraft = useCallback(
    (data: Record<string, Record<string, Record<string, unknown>>>) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch {
        // Storage full or unavailable — ignore
      }
    },
    []
  );

  // Load existing progress on mount (FN-8.1.1.6)
  useEffect(() => {
    // Immediately restore localStorage draft for offline-first UX
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        setFormData(JSON.parse(draft));
      }
      const savedStep = localStorage.getItem(STEP_KEY);
      if (savedStep) {
        setCurrentStep(JSON.parse(savedStep));
      }
    } catch {
      // Corrupt data — ignore
    }

    async function loadProgress() {
      const progress = await getFunnelProgress();
      if (!progress) return;

      // Reconstruct form data from saved levels (server is source of truth)
      const data: Record<string, Record<string, Record<string, unknown>>> = {};
      for (const level of progress.levels) {
        const key = `${level.level}`;
        if (!data[key]) data[key] = {};
        data[key][level.side] = level.data as Record<string, unknown>;
      }

      // Merge: server-saved data takes precedence, keep unsaved drafts
      setFormData((prev) => {
        const merged = { ...prev };
        for (const [lvl, sides] of Object.entries(data)) {
          merged[lvl] = { ...merged[lvl], ...sides };
        }
        return merged;
      });

      // Find where user left off
      const activeLvl = progress.profile?.active_funnel_level || 1;
      const levelSides = progress.levels.filter((l) => l.level === activeLvl);
      const selfDone = levelSides.find(
        (l) => l.side === "self" && l.completed
      );

      const step = {
        level: activeLvl as FunnelLevel,
        side: (selfDone ? "target" : "self") as "self" | "target",
        fieldIndex: 0,
      };
      setCurrentStep(step);
      try {
        localStorage.setItem(STEP_KEY, JSON.stringify(step));
      } catch {
        // ignore
      }
    }
    loadProgress();
  }, []);

  const levelFields = getLevelFields(currentStep.level);
  const totalSections = 3 * 2; // 3 mandatory levels x 2 sides
  const currentSection =
    (currentStep.level - 1) * 2 + (currentStep.side === "target" ? 1 : 0) + 1;
  const overallProgress = (currentSection / totalSections) * 100;

  const currentFieldData =
    formData[currentStep.level]?.[currentStep.side] || {};

  function handleAIComplete(data: Record<string, unknown>) {
    // AI mode completed a level/side — advance to next
    const updated = {
      ...formData,
      [currentStep.level]: {
        ...formData[currentStep.level],
        [currentStep.side]: data,
      },
    };
    setFormData(updated);
    persistDraft(updated);

    if (currentStep.side === "self") {
      const next = { ...currentStep, side: "target" as const, fieldIndex: 0 };
      setCurrentStep(next);
      try { localStorage.setItem(STEP_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } else if (currentStep.level < 3) {
      const next = {
        level: (currentStep.level + 1) as FunnelLevel,
        side: "self" as const,
        fieldIndex: 0,
      };
      setCurrentStep(next);
      try { localStorage.setItem(STEP_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } else {
      // All done — clear drafts
      try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(STEP_KEY); } catch { /* ignore */ }
      router.push("/profile");
    }
  }

  // ── Mode selector ──
  if (!mode) {
    if (!aiOnboarding) {
      // AI modes disabled by feature flag — go straight to manual
      setMode("manual");
      return null;
    }
    return <ModeSelector onSelect={setMode} />;
  }

  // ── AI Chat mode ──
  if (mode === "chatAI") {
    return (
      <ChatOnboarding
        level={currentStep.level}
        side={currentStep.side}
        fields={getLevelFields(currentStep.level).map((f) => f.name)}
        overallProgress={overallProgress}
        onComplete={handleAIComplete}
        onBack={() => setMode(null)}
      />
    );
  }

  // ── AI Voice mode ──
  if (mode === "voiceAI") {
    return (
      <VoiceOnboarding
        level={currentStep.level}
        side={currentStep.side}
        fields={getLevelFields(currentStep.level).map((f) => f.name)}
        overallProgress={overallProgress}
        onComplete={handleAIComplete}
        onBack={() => setMode(null)}
        onFallbackToChat={() => setMode("chatAI")}
      />
    );
  }

  // ── Manual mode (original form flow below) ──

  function updateField(field: string, value: unknown) {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [currentStep.level]: {
          ...prev[currentStep.level],
          [currentStep.side]: {
            ...prev[currentStep.level]?.[currentStep.side],
            [field]: value,
          },
        },
      };
      persistDraft(updated);
      return updated;
    });
  }

  async function handleSaveAndContinue() {
    setSaving(true);
    setError("");

    const data = formData[currentStep.level]?.[currentStep.side] || {};
    const result = await saveFunnelLevel(
      currentStep.level,
      currentStep.side,
      data
    );

    setSaving(false);

    if (!result.success) {
      setError(result.error || t("onboarding.saveFailed"));
      return;
    }

    // Navigate to next section
    if (currentStep.side === "self") {
      const next = { ...currentStep, side: "target" as const, fieldIndex: 0 };
      setCurrentStep(next);
      setShowReflection(true);
      try { localStorage.setItem(STEP_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } else if (currentStep.level < 3) {
      const next = {
        level: (currentStep.level + 1) as FunnelLevel,
        side: "self" as const,
        fieldIndex: 0,
      };
      setCurrentStep(next);
      setShowReflection(true);
      try { localStorage.setItem(STEP_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } else {
      // Mandatory levels complete — clear drafts & go to profile
      try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(STEP_KEY); } catch { /* ignore */ }
      router.push("/profile");
    }
  }

  // Reflection screen (FN-8.1.1.3)
  if (showReflection && reflectionKeys[currentStep.level]) {
    const keys = reflectionKeys[currentStep.level];
    const questionKey = keys[
      currentStep.side === "self" ? 0 : Math.min(1, keys.length - 1)
    ];

    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full space-y-8 text-center">
          <ProgressBar value={overallProgress} size="sm" showPercent={false} />

          <p className="text-sm text-on-surface-muted uppercase tracking-wide">
            {t("onboarding.reflectionPrompt")}
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold text-on-surface leading-relaxed">
            {t(questionKey)}
          </h2>

          <p className="text-on-surface-muted">
            {t(`funnel.levels.${currentStep.level}.analogy`)}
          </p>

          <Button onClick={() => setShowReflection(false)} size="lg">
            {t("common.continue")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <ProgressBar
          value={overallProgress}
          label={t("onboarding.step", {
            current: currentSection,
            total: totalSections,
          })}
          size="sm"
        />

        <div>
          <p className="text-sm text-primary font-medium">
            {t(`funnel.levels.${currentStep.level}.title`)} —{" "}
            {currentStep.side === "self"
              ? t("funnel.selfDescription")
              : t("funnel.targetPerson")}
          </p>
          <h1 className="text-xl font-bold text-on-surface mt-1">
            {t(`funnel.levels.${currentStep.level}.description`)}
          </h1>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-6 flex-1">
        {levelFields.map((field) => (
          <Card key={field.name} variant="outlined" className="space-y-3">
            <CardContent>
              <div className="space-y-2">
                {/* Context explanation (FN-8.1.1.4) */}
                {fieldContextKeys.includes(field.name) && (
                  <p className="text-xs text-on-surface-muted italic">
                    {t(`onboarding.fieldContext.${field.name}`)}
                  </p>
                )}

                {field.type === "select" && field.options ? (
                  <Select
                    label={t(`fields.${field.name}`)}
                    options={field.options}
                    placeholder={t("onboarding.selectPlaceholder")}
                    required={field.required}
                    value={(currentFieldData[field.name] as string) || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                  />
                ) : field.type === "multiselect" && field.choices ? (
                  <div>
                    <label className="text-sm font-medium text-on-surface block mb-2">
                      {t(`fields.${field.name}`)}
                      {field.required && <span className="text-primary ml-1">*</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {field.choices.map((choice) => {
                        const selected = (
                          (currentFieldData[field.name] as string[]) || []
                        ).includes(choice);
                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => {
                              const current =
                                (currentFieldData[field.name] as string[]) || [];
                              updateField(
                                field.name,
                                selected
                                  ? current.filter((v) => v !== choice)
                                  : [...current, choice]
                              );
                            }}
                            className={`px-4 py-2.5 rounded-full text-sm border transition-colors min-h-[44px] ${
                              selected
                                ? "bg-primary text-on-primary border-primary"
                                : "border-border text-on-surface-muted hover:border-primary"
                            }`}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : field.type === "slider" ? (
                  <div>
                    <label className="text-sm font-medium text-on-surface block mb-2">
                      {t(`fields.${field.name}`)}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={(currentFieldData[field.name] as number) || 5}
                      onChange={(e) =>
                        updateField(field.name, Number(e.target.value))
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-on-surface-muted mt-1">
                      <span>{t("onboarding.slider.introvert")}</span>
                      <span>{(currentFieldData[field.name] as number) || 5}</span>
                      <span>{t("onboarding.slider.extravert")}</span>
                    </div>
                  </div>
                ) : field.type === "number" ? (
                  <Input
                    label={t(`fields.${field.name}`)}
                    type="number"
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    value={(currentFieldData[field.name] as number) ?? ""}
                    onChange={(e) =>
                      updateField(field.name, Number(e.target.value))
                    }
                  />
                ) : (
                  <Input
                    label={t(`fields.${field.name}`)}
                    required={field.required}
                    value={(currentFieldData[field.name] as string) || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {error && (
        <p className="text-sm text-error mt-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-8 pt-6 border-t border-border">
        {currentStep.level > 1 || currentStep.side === "target" ? (
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep.side === "target") {
                setCurrentStep((prev) => ({
                  ...prev,
                  side: "self",
                }));
              } else {
                setCurrentStep((prev) => ({
                  level: (prev.level - 1) as FunnelLevel,
                  side: "target",
                  fieldIndex: 0,
                }));
              }
            }}
          >
            {t("common.back")}
          </Button>
        ) : null}

        <Button
          onClick={handleSaveAndContinue}
          loading={saving}
          className="flex-1"
        >
          {currentStep.level === 3 && currentStep.side === "target"
            ? t("common.submit")
            : t("common.continue")}
        </Button>
      </div>
    </div>
  );
}

interface FieldDef {
  name: string;
  type: "text" | "number" | "select" | "multiselect" | "slider";
  required: boolean;
  options?: { value: string; label: string }[];
  choices?: string[];
  min?: number;
  max?: number;
}

function getLevelFields(level: FunnelLevel): FieldDef[] {
  switch (level) {
    case 1:
      return [
        { name: "age", type: "number", required: true, min: 18, max: 120 },
        { name: "gender", type: "select", required: true, options: [...fieldOptions.gender] },
        { name: "location", type: "text", required: true },
        { name: "relationshipIntention", type: "select", required: true, options: [...fieldOptions.relationshipIntention] },
        { name: "coreValues", type: "multiselect", required: true, choices: [...fieldOptions.coreValues] },
        { name: "sexualOrientation", type: "select", required: true, options: [...fieldOptions.sexualOrientation] },
        { name: "languages", type: "multiselect", required: true, choices: [...fieldOptions.languages] },
      ];
    case 2:
      return [
        { name: "personalityType", type: "select", required: true, options: [...fieldOptions.personalityType] },
        { name: "introversionExtraversion", type: "slider", required: true },
        { name: "communicationStyle", type: "select", required: true, options: [...fieldOptions.communicationStyle] },
        { name: "dailyRoutine", type: "select", required: true, options: [...fieldOptions.dailyRoutine] },
        { name: "diet", type: "select", required: true, options: [...fieldOptions.diet] },
        { name: "pets", type: "select", required: true, options: [...fieldOptions.pets] },
        { name: "religionSpirituality", type: "select", required: true, options: [...fieldOptions.religionSpirituality] },
        { name: "politicalOrientation", type: "select", required: true, options: [...fieldOptions.politicalOrientation] },
      ];
    case 3:
      return [
        { name: "desireForChildren", type: "select", required: true, options: [...fieldOptions.desireForChildren] },
        { name: "childrenTimeline", type: "select", required: true, options: [...fieldOptions.childrenTimeline] },
        { name: "careerAmbitions", type: "text", required: true },
        { name: "incomeSituation", type: "select", required: true, options: [...fieldOptions.incomeSituation] },
        { name: "housingGoal", type: "select", required: true, options: [...fieldOptions.housingGoal] },
        { name: "willingnessToRelocate", type: "select", required: true, options: [...fieldOptions.willingnessToRelocate] },
        { name: "educationalBackground", type: "select", required: true, options: [...fieldOptions.educationalBackground] },
        { name: "familyVision", type: "text", required: true },
        { name: "retirementAttitude", type: "text", required: true },
      ];
    case 4:
      return [
        { name: "hobbiesDetailed", type: "text", required: false },
        { name: "sportsFitness", type: "text", required: false },
        { name: "travelPreferences", type: "text", required: false },
        { name: "musicTaste", type: "text", required: false },
        { name: "sexualPreferences", type: "text", required: false },
        { name: "quirks", type: "text", required: false },
        { name: "unconventionalLifeModels", type: "text", required: false },
        { name: "specialFamilyBonds", type: "text", required: false },
        { name: "fearsPhobias", type: "text", required: false },
      ];
    case 5:
      return [
        { name: "foodPreferences", type: "text", required: false },
        { name: "sleepHabits", type: "text", required: false },
        { name: "tidinessChaos", type: "text", required: false },
        { name: "socialMediaUsage", type: "text", required: false },
        { name: "mediaConsumption", type: "text", required: false },
        { name: "culturalTraditions", type: "text", required: false },
        { name: "holidays", type: "text", required: false },
        { name: "humorType", type: "text", required: false },
        { name: "conflictResolutionStyle", type: "text", required: false },
      ];
  }
}
