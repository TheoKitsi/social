"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

export default function AboutPage() {
  const t = useTranslations();

  const failures = [
    "fakeProfiles",
    "payToPlay",
    "noBans",
    "noSupport",
    "algorithmManipulation",
    "subscriptionTraps",
    "safetyFailures",
    "noRealMatching",
    "ghosting",
    "engagementOverConnection",
    "superficiality",
    "dataExploitation",
  ] as const;

  return (
    <div className="min-h-dvh bg-secondary">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-secondary/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
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
        <nav className="flex items-center gap-3">
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

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* ── Origin Story ── */}
        <section className="mb-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4">
            {t("about.origin.label")}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] mb-8">
            {t("about.origin.title")}
          </h1>

          <div className="space-y-6 text-base md:text-lg text-on-surface-muted leading-relaxed">
            <p>{t("about.origin.p1")}</p>
            <p>{t("about.origin.p2")}</p>
            <p>{t("about.origin.p3")}</p>
            <p>{t("about.origin.p4")}</p>

            <blockquote className="border-l-2 border-primary pl-6 py-2 text-on-surface italic">
              {t("about.origin.quote")}
            </blockquote>

            <p>{t("about.origin.p5")}</p>
            <p className="text-on-surface font-medium">{t("about.origin.p6")}</p>
          </div>
        </section>

        {/* ── The Problem ── */}
        <section className="mb-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4">
            {t("about.problem.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] mb-4">
            {t("about.problem.title")}
          </h2>
          <p className="text-base md:text-lg text-on-surface-muted leading-relaxed mb-4">
            {t("about.problem.subtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-[var(--radius-card)] overflow-hidden border border-border">
            {failures.map((key) => (
              <div
                key={key}
                className="bg-surface p-5 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <h3 className="text-sm font-semibold text-on-surface">
                    {t(`about.problem.failures.${key}.title`)}
                  </h3>
                </div>
                <p className="text-xs text-on-surface-muted leading-relaxed pl-3.5">
                  {t(`about.problem.failures.${key}.description`)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-on-surface-muted text-center">
            {t("about.problem.source")}
          </p>
        </section>

        {/* ── The PRAGMA Approach ── */}
        <section className="mb-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4">
            {t("about.approach.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] mb-8">
            {t("about.approach.title")}
          </h2>

          <div className="space-y-6">
            {(["verification", "depth", "transparency", "fairness", "privacy", "success"] as const).map(
              (principle) => (
                <div
                  key={principle}
                  className="rounded-[var(--radius-card)] border border-border bg-surface/50 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <PrincipleIcon principle={principle} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-on-surface mb-1">
                        {t(`about.approach.principles.${principle}.title`)}
                      </h3>
                      <p className="text-sm text-on-surface-muted leading-relaxed">
                        {t(`about.approach.principles.${principle}.description`)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* ── Name ── */}
        <section className="mb-20">
          <p className="text-xs font-medium text-primary tracking-[var(--tracking-widest)] uppercase mb-4">
            {t("about.name.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight tracking-[var(--tracking-tight)] mb-4">
            {t("about.name.title")}
          </h2>
          <p className="text-base md:text-lg text-on-surface-muted leading-relaxed">
            {t("about.name.description")}
          </p>
        </section>

        {/* ── CTA ── */}
        <section className="text-center py-12 border-t border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">
            {t("about.cta.title")}
          </h2>
          <p className="text-base text-on-surface-muted mb-8 max-w-lg mx-auto">
            {t("about.cta.subtitle")}
          </p>
          <Link href="/plans">
            <Button size="lg">{t("landing.cta")}</Button>
          </Link>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-secondary/80 px-6 py-3 text-xs text-on-surface-muted">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-3xl mx-auto">
          <p className="tracking-[var(--tracking-wide)]">
            &copy; {new Date().getFullYear()} PRAGMA &mdash; {t("common.tagline")}
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/legal/impressum" className="hover:text-primary transition-colors">
              {t("legal.impressum.title")}
            </Link>
            <Link href="/legal/datenschutz" className="hover:text-primary transition-colors">
              {t("legal.privacy.title")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function PrincipleIcon({ principle }: { principle: string }) {
  const cls = "w-4 h-4 text-primary";
  switch (principle) {
    case "verification":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    case "depth":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case "transparency":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "fairness":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
    case "privacy":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "success":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    default:
      return null;
  }
}
