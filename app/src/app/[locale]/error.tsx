"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6 text-center bg-secondary">
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-error"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-on-surface font-medium">{t("common.error")}</p>
      <Button onClick={reset} size="sm">
        {t("common.retry")}
      </Button>
    </div>
  );
}
