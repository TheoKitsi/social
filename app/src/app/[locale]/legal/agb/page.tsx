import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AGBPage() {
  const t = useTranslations("legal");

  return (
    <div className="min-h-dvh bg-secondary bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-secondary/80 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 512 512" className="text-primary shrink-0">
            <g fill="none" stroke="currentColor" strokeWidth="32" strokeLinejoin="round">
              <polyline points="100,120 200,256 100,392" />
              <polyline points="412,120 312,256 412,392" />
              <rect x="236" y="236" width="40" height="40" transform="rotate(45 256 256)" fill="currentColor" stroke="none" />
            </g>
          </svg>
          <span className="text-lg font-semibold tracking-[var(--tracking-tight)]">
            PRAGMA
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-[var(--tracking-tight)]">
          {t("terms.title")}
        </h1>
        <p className="text-sm text-on-surface-muted mb-8">
          {t("privacy.lastUpdated")}: 03.04.2026
        </p>

        <div className="space-y-8 text-on-surface-muted text-sm leading-relaxed">

          {/* §1 Scope */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s1Title")}</h2>
            <p>{t("terms.s1Text")}</p>
          </section>

          {/* §2 Registration & Eligibility */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s2Title")}</h2>
            <p>{t("terms.s2Text")}</p>
          </section>

          {/* §3 Services */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s3Title")}</h2>
            <p>{t("terms.s3Text")}</p>
          </section>

          {/* §4 User Obligations */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s4Title")}</h2>
            <p>{t("terms.s4Text")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("terms.s4Rule1")}</li>
              <li>{t("terms.s4Rule2")}</li>
              <li>{t("terms.s4Rule3")}</li>
              <li>{t("terms.s4Rule4")}</li>
              <li>{t("terms.s4Rule5")}</li>
            </ul>
          </section>

          {/* §5 Subscriptions & Payments */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s5Title")}</h2>
            <p>{t("terms.s5Text")}</p>
          </section>

          {/* §6 Right of Withdrawal — §312g BGB */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s6Title")}</h2>
            <p>{t("terms.s6Text")}</p>
          </section>

          {/* §7 Intellectual Property */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s7Title")}</h2>
            <p>{t("terms.s7Text")}</p>
          </section>

          {/* §8 Liability Limitation */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s8Title")}</h2>
            <p>{t("terms.s8Text")}</p>
          </section>

          {/* §9 Account Termination */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s9Title")}</h2>
            <p>{t("terms.s9Text")}</p>
          </section>

          {/* §10 Data Protection */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s10Title")}</h2>
            <p>{t("terms.s10Text")}</p>
          </section>

          {/* §11 Governing Law */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s11Title")}</h2>
            <p>{t("terms.s11Text")}</p>
          </section>

          {/* §12 Severability */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("terms.s12Title")}</h2>
            <p>{t("terms.s12Text")}</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-muted">
          <p>&copy; {new Date().getFullYear()} PRAGMA</p>
          <nav className="flex items-center gap-4">
            <Link href="/legal/impressum" className="hover:text-primary transition-colors">{t("impressum.title")}</Link>
            <Link href="/legal/datenschutz" className="hover:text-primary transition-colors">{t("privacy.title")}</Link>
            <Link href="/legal/agb" className="hover:text-primary transition-colors font-medium text-on-surface">{t("terms.title")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
