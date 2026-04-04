import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const FAQ_KEYS = [
  "whatIsPragma",
  "howMatching",
  "whyFunnel",
  "isDataSafe",
  "howCancel",
  "howDelete",
  "howVerify",
  "howContact",
] as const;

export default function SupportPage() {
  const t = useTranslations("support");

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
          {t("title")}
        </h1>
        <p className="text-on-surface-muted text-sm mb-10">{t("subtitle")}</p>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-on-surface uppercase tracking-wider text-xs mb-4">
            {t("faqTitle")}
          </h2>

          <div className="space-y-3">
            {FAQ_KEYS.map((key) => (
              <details
                key={key}
                className="group border border-border rounded-xl bg-surface/50 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-on-surface hover:text-primary transition-colors select-none">
                  {t(`faq.${key}.q`)}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-on-surface-muted shrink-0 ml-4 transition-transform group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-on-surface-muted leading-relaxed border-t border-border/50 pt-3">
                  {t(`faq.${key}.a`)}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-12 p-6 border border-border rounded-2xl bg-surface/50 text-center space-y-3">
          <h2 className="text-lg font-semibold text-on-surface">{t("contactTitle")}</h2>
          <p className="text-sm text-on-surface-muted">{t("contactDescription")}</p>
          <a
            href="mailto:support@pragma.app"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            support@pragma.app
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-muted">
          <p>&copy; {new Date().getFullYear()} PRAGMA</p>
          <nav className="flex items-center gap-4">
            <Link href="/legal/impressum" className="hover:text-primary transition-colors">Imprint</Link>
            <Link href="/legal/datenschutz" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/legal/agb" className="hover:text-primary transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
