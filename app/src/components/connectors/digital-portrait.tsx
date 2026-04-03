"use client";

import { Card, CardContent } from "@/components/ui";
import type { ExternalInsight, ExternalSignals } from "@/types/connectors";

interface DigitalPortraitProps {
  insights: ExternalInsight[];
  t: (key: string) => string;
}

function SignalBar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-muted">{label}</span>
        <span className="text-on-surface font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TraitChip({ label }: { label: string }) {
  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">
      {label}
    </span>
  );
}

export function DigitalPortrait({ insights, t }: DigitalPortraitProps) {
  if (insights.length === 0) return null;

  // Aggregate all signals across connectors
  const allInterests = new Set<string>();
  const allValues = new Set<string>();
  const allGenres = new Set<string>();
  const allLifestyle = new Set<string>();
  let curiositySum = 0;
  let opennessSum = 0;
  let _conscientiousnessSum = 0;
  let numericCount = 0;
  let communicationStyle: string | null = null;
  let contentDepth: string | null = null;
  let socialEnergy: string | null = null;

  for (const insight of insights) {
    const s: ExternalSignals = insight.signals;
    if (s.interests) s.interests.forEach((i) => allInterests.add(i));
    if (s.values) s.values.forEach((v) => allValues.add(v));
    if (s.genre_affinity) s.genre_affinity.forEach((g) => allGenres.add(g));
    if (s.lifestyle_indicators) s.lifestyle_indicators.forEach((l) => allLifestyle.add(l));
    if (s.curiosity_score != null) { curiositySum += s.curiosity_score; numericCount++; }
    if (s.openness_to_experience != null) { opennessSum += s.openness_to_experience; numericCount++; }
    if (s.conscientiousness != null) { _conscientiousnessSum += s.conscientiousness; numericCount++; }
    if (s.communication_style && !communicationStyle) communicationStyle = s.communication_style;
    if (s.content_depth && !contentDepth) contentDepth = s.content_depth;
    if (s.social_energy && !socialEnergy) socialEnergy = s.social_energy;
  }

  const avgCuriosity = numericCount > 0 ? curiositySum / insights.length : 0;
  const avgOpenness = numericCount > 0 ? opennessSum / insights.length : 0;

  return (
    <Card variant="outlined" className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      <CardContent className="space-y-5 pt-5">
        <div>
          <h2 className="text-lg font-bold text-on-surface tracking-tight">
            {t("connectors.portrait.title")}
          </h2>
          <p className="text-xs text-on-surface-muted mt-1">
            {t("connectors.portrait.subtitle")}
          </p>
        </div>

        {/* Numeric scores */}
        {(avgCuriosity > 0 || avgOpenness > 0) && (
          <div className="space-y-3">
            {avgCuriosity > 0 && (
              <SignalBar label={t("connectors.portrait.curiosity")} value={avgCuriosity} />
            )}
            {avgOpenness > 0 && (
              <SignalBar label={t("connectors.portrait.openness")} value={avgOpenness} />
            )}
          </div>
        )}

        {/* Trait labels */}
        <div className="space-y-3">
          {communicationStyle && (
            <div>
              <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
                {t("connectors.portrait.communicationStyle")}
              </span>
              <p className="text-sm font-medium text-on-surface capitalize mt-0.5">
                {communicationStyle}
              </p>
            </div>
          )}
          {contentDepth && (
            <div>
              <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
                {t("connectors.portrait.contentDepth")}
              </span>
              <p className="text-sm font-medium text-on-surface capitalize mt-0.5">
                {contentDepth.replace("_", " ")}
              </p>
            </div>
          )}
          {socialEnergy && (
            <div>
              <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
                {t("connectors.portrait.socialEnergy")}
              </span>
              <p className="text-sm font-medium text-on-surface capitalize mt-0.5">
                {socialEnergy}
              </p>
            </div>
          )}
        </div>

        {/* Interest chips */}
        {allInterests.size > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
              {t("connectors.portrait.interests")}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[...allInterests].slice(0, 12).map((interest) => (
                <TraitChip key={interest} label={interest} />
              ))}
            </div>
          </div>
        )}

        {/* Values */}
        {allValues.size > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
              {t("connectors.portrait.values")}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[...allValues].slice(0, 8).map((value) => (
                <TraitChip key={value} label={value} />
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] text-on-surface-muted">
            {t("connectors.portrait.basedOn")} {insights.length} {t("connectors.portrait.sources")}
            {" — "}
            {t("connectors.portrait.transparency")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
