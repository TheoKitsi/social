"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <p className="text-on-surface font-medium">{t("common.error")}</p>
      <Button onClick={reset} size="sm">
        {t("common.retry")}
      </Button>
    </div>
  );
}
