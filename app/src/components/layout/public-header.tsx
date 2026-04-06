"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

interface PublicHeaderProps {
  /** Show back arrow (false for landing page, true for subpages) */
  showBack?: boolean;
  /** Show "Warum PRAGMA" link in nav */
  showAboutLink?: boolean;
  /** Show "Preise" link in nav */
  showPricesLink?: boolean;
}

export function PublicHeader({
  showBack = false,
  showAboutLink = false,
  showPricesLink = false,
}: PublicHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close menu on route change / escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-secondary/80 backdrop-blur-md safe-top">
        {/* Left: back + logo */}
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="mr-1 p-1.5 -ml-1.5 rounded-lg text-on-surface-muted hover:text-primary hover:bg-surface/50 transition-colors"
              aria-label={t("common.back")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 512 512" className="text-primary shrink-0">
              <g fill="none" stroke="currentColor" strokeWidth="32" strokeLinejoin="round">
                <polyline points="100,120 200,256 100,392" />
                <polyline points="412,120 312,256 412,392" />
                <rect x="236" y="236" width="40" height="40" transform="rotate(45 256 256)" fill="currentColor" stroke="none" />
              </g>
            </svg>
            <span className="text-lg font-semibold text-on-surface tracking-[var(--tracking-tight)]">
              {t("common.appName")}
            </span>
          </Link>
        </div>

        {/* Right: desktop nav (hidden on mobile) */}
        <nav className="hidden sm:flex items-center gap-3">
          {showAboutLink && (
            <Link href="/about" className="text-sm text-on-surface-muted hover:text-primary transition-colors">
              {t("about.link")}
            </Link>
          )}
          {showPricesLink && (
            <Link href="/plans" className="text-sm text-on-surface-muted hover:text-primary transition-colors">
              {t("common.prices")}
            </Link>
          )}
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("landing.login")}
            </Button>
          </Link>
          <Link href="/plans">
            <Button size="sm">{t("landing.cta")}</Button>
          </Link>
        </nav>

        {/* Right: mobile hamburger (visible on mobile only) */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 -mr-2 rounded-lg text-on-surface-muted hover:text-primary hover:bg-surface/50 transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-40 sm:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Panel */}
          <nav className="absolute top-[calc(theme(spacing.14)+env(safe-area-inset-top))] right-0 left-0 bg-secondary border-b border-border shadow-[var(--shadow-lg)] px-6 py-6 space-y-1 animate-fade-in-up">
            {showAboutLink && (
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="block py-3 text-base text-on-surface-muted hover:text-primary transition-colors border-b border-border/50"
              >
                {t("about.link")}
              </Link>
            )}
            {showPricesLink && (
              <Link
                href="/plans"
                onClick={() => setOpen(false)}
                className="block py-3 text-base text-on-surface-muted hover:text-primary transition-colors border-b border-border/50"
              >
                {t("common.prices")}
              </Link>
            )}
            <Link
              href="/support"
              onClick={() => setOpen(false)}
              className="block py-3 text-base text-on-surface-muted hover:text-primary transition-colors border-b border-border/50"
            >
              {t("support.title")}
            </Link>
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  {t("landing.login")}
                </Button>
              </Link>
              <Link href="/plans" onClick={() => setOpen(false)}>
                <Button className="w-full">{t("landing.cta")}</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
