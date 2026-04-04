import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { HeroVisual } from "@/components/hero-visual";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="h-dvh flex flex-col bg-secondary bg-grid overflow-hidden relative">
      {/* Connection particles — behind all content */}
      <HeroVisual />
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-secondary/80 backdrop-blur-md relative">
        <div className="flex items-center gap-2">
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
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/about" className="text-sm text-on-surface-muted hover:text-primary transition-colors">
            {t("about.link")}
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("landing.login")}
            </Button>
          </Link>
          <Link href="/plans">
            <Button size="sm">{t("landing.cta")}</Button>
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 overflow-auto relative z-10">
        <section className="flex flex-col items-center justify-center max-w-3xl text-center py-8 md:py-0">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-3 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
            {t("common.tagline")}
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            {t("landing.hero")}
          </h1>

          <p className="mt-4 text-base md:text-lg text-on-surface-muted leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {t("landing.subtitle")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <Link href="/plans">
              <Button size="lg">{t("landing.cta")}</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">{t("landing.login")}</Button>
            </Link>
          </div>

          {/* ── Features ── */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
            {(["funnel", "matching", "consent", "verified"] as const).map(
              (feature, i) => (
                <div
                  key={feature}
                  className="hover-lift rounded-[var(--radius-card)] border border-border bg-surface/50 p-4 md:p-5 flex flex-col items-center text-center space-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${200 + i * 60}ms` }}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-1">
                    <FeatureIcon feature={feature} />
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    {t(`landing.features.${feature}.title`)}
                  </h3>
                  <p className="text-xs text-on-surface-muted leading-relaxed">
                    {t(`landing.features.${feature}.description`)}
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="sticky bottom-0 border-t border-border bg-secondary/80 backdrop-blur-md px-6 py-3 text-xs text-on-surface-muted relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="tracking-[var(--tracking-wide)]">
            &copy; {new Date().getFullYear()} PRAGMA &mdash; {t("common.tagline")}
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="hover:text-primary transition-colors">
              {t("about.link")}
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
    </div>
  );
}

function FeatureIcon({ feature }: { feature: string }) {
  const iconClass = "w-5 h-5 text-primary";
  switch (feature) {
    case "funnel":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      );
    case "matching":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "consent":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "verified":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    default:
      return null;
  }
}
