"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui";

export type OnboardingMode = "voiceAI" | "chatAI" | "manual";

interface ModeSelectorProps {
  onSelect: (mode: OnboardingMode) => void;
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  const t = useTranslations("onboarding.modeSelect");

  const modes: { key: OnboardingMode; icon: React.ReactNode; recommended?: boolean }[] = [
    {
      key: "voiceAI",
      recommended: true,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      key: "chatAI",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      key: "manual",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">
            {t("title")}
          </h1>
          <p className="text-sm text-on-surface-muted">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4">
          {modes.map((mode) => (
            <Card
              key={mode.key}
              variant="outlined"
              className={`cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-[var(--shadow-accent-sm)] ${
                mode.recommended ? "border-primary/30" : ""
              }`}
              onClick={() => onSelect(mode.key)}
            >
              <CardContent className="flex items-center gap-5 py-5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary">
                  {mode.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-on-surface">
                      {t(mode.key)}
                    </h3>
                    {mode.recommended && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary text-on-primary rounded-full">
                        {t("recommended")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-muted mt-1">
                    {t(`${mode.key}Desc`)}
                  </p>
                </div>
                <svg className="w-5 h-5 text-on-surface-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
