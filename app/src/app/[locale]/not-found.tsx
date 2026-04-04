import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <h1 className="text-6xl font-bold text-on-surface">404</h1>
      <p className="text-lg font-medium text-on-surface">{t("notFound")}</p>
      <p className="text-sm text-on-surface-muted max-w-md">{t("notFoundDescription")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        {t("goHome")}
      </Link>
    </div>
  );
}
