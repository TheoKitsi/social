import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { HeroVisual } from "@/components/hero-visual";
import { ScrollSection } from "@/components/scroll-section";

export default function LandingPage() {
  const t = useTranslations();

  const industryCategories = [
    { key: "swipe", score: "1.2" },
    { key: "social", score: "1.3" },
    { key: "algorithm", score: "1.2" },
    { key: "legacy", score: "1.2" },
    { key: "premium", score: "2.1" },
    { key: "exclusive", score: "2.0" },
  ] as const;

  const differentiators = [
    "verification",
    "depth",
    "transparency",
    "fairness",
    "privacy",
    "success",
  ] as const;

  return (
    <div className="h-dvh flex flex-col bg-secondary overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-secondary/80 backdrop-blur-md">
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
          <Link href="/about" className="text-sm text-on-surface-muted hover:text-primary transition-colors hidden sm:inline-flex">
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

      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 bg-grid overflow-hidden snap-start snap-always pt-14">
        <HeroVisual />
        <ScrollSection className="relative z-10 flex flex-col items-center justify-center max-w-3xl text-center">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-3">
            {t("common.tagline")}
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)]">
            {t("landing.hero")}
          </h1>

          <p className="mt-4 text-base md:text-lg text-on-surface-muted leading-relaxed max-w-xl">
            {t("landing.subtitle")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/plans">
              <Button size="lg">{t("landing.cta")}</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">{t("landing.login")}</Button>
            </Link>
          </div>
        </ScrollSection>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-40">
          <svg className="w-5 h-5 text-on-surface-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: The Question ── */}
      <section className="min-h-dvh flex items-center justify-center px-6 snap-start snap-always">
        <ScrollSection className="max-w-3xl mx-auto text-center py-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4">
            {t("landing.question.label")}
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)]">
            {t("landing.question.title")}
          </h2>
          <p className="mt-6 text-base md:text-lg text-on-surface-muted leading-relaxed max-w-2xl mx-auto">
            {t("landing.question.p1")}
          </p>
          <blockquote className="mt-8 text-lg md:text-xl font-semibold text-primary leading-relaxed italic max-w-2xl mx-auto border-l-2 border-primary pl-6 text-left">
            {t("landing.question.quote")}
          </blockquote>
          <p className="mt-8 text-base text-on-surface-muted leading-relaxed max-w-2xl mx-auto">
            {t("landing.question.p2")}
          </p>
        </ScrollSection>
      </section>

      {/* ── Section 3: Industry Reality ── */}
      <section className="min-h-dvh flex items-center justify-center px-6 snap-start snap-always bg-surface/30">
        <ScrollSection className="max-w-4xl mx-auto py-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4 text-center">
            {t("landing.industry.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] text-center">
            {t("landing.industry.title")}
          </h2>
          <p className="mt-3 text-sm text-on-surface-muted text-center max-w-xl mx-auto">
            {t("landing.industry.subtitle")}
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {industryCategories.map((cat) => (
              <div
                key={cat.key}
                className="rounded-[var(--radius-card)] border border-border bg-surface/50 p-4 text-center"
              >
                <p className="text-sm font-medium text-on-surface-muted">{t(`landing.industry.categories.${cat.key}`)}</p>
                <p className="mt-1 text-2xl font-bold text-red-400">{cat.score}<span className="text-sm font-normal text-on-surface-muted">/5</span></p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-on-surface-muted/60 text-center">
            {t("landing.industry.source")}
          </p>
        </ScrollSection>
      </section>

      {/* ── Section 4: How It Works ── */}
      <section className="min-h-dvh flex items-center justify-center px-6 snap-start snap-always">
        <ScrollSection className="max-w-4xl mx-auto py-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4 text-center">
            {t("landing.process.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] text-center">
            {t("landing.process.title")}
          </h2>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(["funnel", "matching", "consent", "verified"] as const).map(
              (feature) => (
                <div
                  key={feature}
                  className="hover-lift rounded-[var(--radius-card)] border border-border bg-surface/50 p-4 md:p-5 flex flex-col items-center text-center space-y-2"
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
        </ScrollSection>
      </section>

      {/* ── Section 5: The Difference ── */}
      <section className="min-h-dvh flex items-center justify-center px-6 snap-start snap-always bg-surface/30">
        <ScrollSection className="max-w-5xl mx-auto py-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4 text-center">
            {t("landing.different.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] text-center">
            {t("landing.different.title")}
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {differentiators.map((key) => (
              <div
                key={key}
                className="rounded-[var(--radius-card)] border border-border bg-secondary p-5 md:p-6"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-3">
                  <DifferentiatorIcon id={key} />
                </div>
                <h3 className="text-sm font-semibold text-on-surface mb-1">
                  {t(`landing.different.items.${key}.title`)}
                </h3>
                <p className="text-xs text-on-surface-muted leading-relaxed">
                  {t(`landing.different.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </ScrollSection>
      </section>

      {/* ── Section 6: Final CTA ── */}
      <section className="min-h-dvh flex items-center justify-center px-6 snap-start snap-always">
        <ScrollSection className="max-w-2xl mx-auto text-center py-20">
          <h2 className="text-2xl md:text-4xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)]">
            {t("landing.finalCta.title")}
          </h2>
          <p className="mt-4 text-base text-on-surface-muted leading-relaxed">
            {t("landing.finalCta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/plans">
              <Button size="lg">{t("landing.cta")}</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">{t("landing.finalCta.learnMore")}</Button>
            </Link>
          </div>
        </ScrollSection>
      </section>

      {/* ── Footer (within last snap section) ── */}
      <footer className="border-t border-border bg-secondary/80 backdrop-blur-md px-6 py-3 text-xs text-on-surface-muted snap-end">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="tracking-[var(--tracking-wide)]">
            &copy; {new Date().getFullYear()} PRAGMA &mdash; {t("common.tagline")}
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="hover:text-primary transition-colors">
              {t("about.link")}
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

function DifferentiatorIcon({ id }: { id: string }) {
  const c = "w-5 h-5 text-primary";
  switch (id) {
    case "verification":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "depth":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case "transparency":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "fairness":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
    case "privacy":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "success":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return null;
  }
}
