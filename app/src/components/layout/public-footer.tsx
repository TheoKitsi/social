"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface PublicFooterProps {
  /** Fixed to bottom of viewport (default: true) */
  fixed?: boolean;
}

export function PublicFooter({ fixed = true }: PublicFooterProps) {
  const t = useTranslations();

  return (
    <footer
      className={`${
        fixed ? "fixed bottom-0 left-0 right-0" : ""
      } z-40 border-t border-border bg-secondary/90 backdrop-blur-md px-6 py-2.5 text-xs text-on-surface-muted safe-bottom`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 max-w-5xl mx-auto">
        <p className="tracking-[var(--tracking-wide)]">
          &copy; {new Date().getFullYear()} PRAGMA
        </p>
        <nav className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <Link href="/plans" className="hover:text-primary transition-colors">
            {t("common.prices")}
          </Link>
          <Link href="/support" className="hover:text-primary transition-colors">
            {t("support.title")}
          </Link>
          <Link href="/legal/impressum" className="hover:text-primary transition-colors">
            {t("legal.impressum.title")}
          </Link>
          <Link href="/legal/datenschutz" className="hover:text-primary transition-colors">
            {t("legal.privacy.title")}
          </Link>
          <Link href="/legal/agb" className="hover:text-primary transition-colors">
            {t("legal.terms.title")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
