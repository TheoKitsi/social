"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, Button } from "@/components/ui";

type PlanKey = "essentials" | "premium" | "elite";

export default function PlansPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [billing, setBilling] = useState<"monthly" | "annually">("monthly");

  function formatPrice(value: string) {
    const num = parseFloat(value);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(num);
  }

  const plans: { key: PlanKey; tierKey: string; popular?: boolean }[] = [
    { key: "essentials", tierKey: "essentialsTier" },
    { key: "premium", tierKey: "premiumTier", popular: true },
    { key: "elite", tierKey: "eliteTier" },
  ];

  const featureMatrix: {
    labelKey: string;
    essentials: boolean | string;
    premium: boolean | string;
    elite: boolean | string;
  }[] = [
    { labelKey: "matches", essentials: t("subscription.featureValues.essentialsMatches"), premium: t("subscription.featureValues.premiumMatches"), elite: t("subscription.featureValues.eliteMatches") },
    { labelKey: "messaging", essentials: true, premium: true, elite: true },
    { labelKey: "aiAssistant", essentials: false, premium: true, elite: true },
    { labelKey: "advancedFilters", essentials: false, premium: true, elite: true },
    { labelKey: "detailedReports", essentials: false, premium: true, elite: true },
    { labelKey: "profileBoost", essentials: false, premium: false, elite: true },
    { labelKey: "readReceipts", essentials: false, premium: true, elite: true },
    { labelKey: "priorityMatching", essentials: false, premium: false, elite: true },
    { labelKey: "prioritySupport", essentials: false, premium: false, elite: true },
    { labelKey: "profileCoaching", essentials: false, premium: false, elite: true },
  ];

  return (
    <div className="w-full max-w-5xl animate-fade-in-up space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">
          {t("subscription.choosePlan")}
        </h1>
        <p className="text-sm text-on-surface-muted max-w-md mx-auto">
          {t("subscription.trialDesc")}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            billing === "monthly"
              ? "bg-primary text-on-primary"
              : "bg-surface-variant text-on-surface-muted hover:text-on-surface"
          }`}
        >
          {t("subscription.monthly")}
        </button>
        <button
          onClick={() => setBilling("annually")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            billing === "annually"
              ? "bg-primary text-on-primary"
              : "bg-surface-variant text-on-surface-muted hover:text-on-surface"
          }`}
        >
          {t("subscription.annually")}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
            {t("subscription.annualSave", { percent: "20" })}
          </span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price =
            billing === "monthly"
              ? t(`subscription.${plan.tierKey}.priceMonthly`)
              : t(`subscription.${plan.tierKey}.priceAnnual`);
          return (
            <Card
              key={plan.key}
              variant="outlined"
              className={`relative transition-all duration-300 ${
                plan.popular
                  ? "border-primary/40 shadow-[var(--shadow-accent)]"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-primary text-on-primary rounded-full shadow-[var(--shadow-accent-sm)]">
                    {t("subscription.premiumTier.popular")}
                  </span>
                </div>
              )}
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-on-surface">
                    {t(`subscription.${plan.tierKey}.name`)}
                  </h3>
                  <p className="text-xs text-on-surface-muted leading-relaxed">
                    {t(`subscription.${plan.tierKey}.description`)}
                  </p>
                  <div className="pt-2">
                    <span className="text-3xl font-bold text-on-surface">
                      {formatPrice(price)}
                    </span>
                    <span className="text-sm text-on-surface-muted">
                      {t("subscription.perMonth")}
                    </span>
                  </div>
                  {billing === "annually" && (
                    <p className="text-xs text-on-surface-muted">
                      {t("subscription.billedAnnually")}
                    </p>
                  )}
                </div>

                <Link
                  href={`/register?plan=${plan.key}&billing=${billing}`}
                >
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                  >
                    {t("subscription.choosePlan")}
                  </Button>
                </Link>

                <ul className="space-y-2.5 pt-2">
                  {featureMatrix.map((feat) => {
                    const val = feat[plan.key];
                    const available =
                      typeof val === "string" ? true : val;
                    return (
                      <li
                        key={feat.labelKey}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        {available ? (
                          <svg
                            className="w-4 h-4 text-green-400 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-on-surface-muted/30 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={
                            available
                              ? "text-on-surface"
                              : "text-on-surface-muted/50"
                          }
                        >
                          {typeof val === "string"
                            ? `${t(`subscription.features.${feat.labelKey}`)}: ${val}`
                            : t(`subscription.features.${feat.labelKey}`)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Already have an account */}
      <div className="text-center text-sm text-on-surface-muted">
        {t("auth.hasAccount")}{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          {t("auth.login")}
        </Link>
      </div>
    </div>
  );
}
