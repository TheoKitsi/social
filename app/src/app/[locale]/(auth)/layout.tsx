import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();

  return (
    <div className="min-h-dvh bg-secondary bg-grid flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
      <footer className="py-4 px-6 text-xs text-on-surface-muted safe-bottom">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="tracking-[var(--tracking-wide)]">
            PRAGMA &mdash; {t("common.tagline")}
          </p>
          <nav className="flex items-center gap-1">
            <Link href="/legal/impressum" className="hover:text-primary transition-colors min-h-[44px] px-2 flex items-center">
              {t("legal.impressum.title")}
            </Link>
            <Link href="/legal/datenschutz" className="hover:text-primary transition-colors min-h-[44px] px-2 flex items-center">
              {t("legal.privacy.title")}
            </Link>
            <Link href="/legal/agb" className="hover:text-primary transition-colors min-h-[44px] px-2 flex items-center">
              {t("legal.terms.title")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
