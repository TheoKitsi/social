import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ImpressumPage() {
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
        <h1 className="text-3xl font-bold text-on-surface mb-8 tracking-[var(--tracking-tight)]">
          {t("impressum.title")}
        </h1>

        <div className="space-y-8 text-on-surface-muted text-sm leading-relaxed">

          {/* §5 TMG — Company Information */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.companyInfo")}</h2>
            <p>PRAGMA GmbH <span className="text-on-surface-muted/60">[TODO: Confirm legal entity]</span></p>
            <p>Musterstraße 1 <span className="text-on-surface-muted/60">[TODO: Real address]</span></p>
            <p>80331 München, Deutschland</p>
          </section>

          {/* Contact */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.contact")}</h2>
            <p>E-Mail: contact@pragma.app <span className="text-on-surface-muted/60">[TODO: Real email]</span></p>
            <p>Telefon: +49 (0) xxx xxxxxxx <span className="text-on-surface-muted/60">[TODO: Real phone]</span></p>
          </section>

          {/* Commercial Register */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.register")}</h2>
            <p>{t("impressum.registerCourt")}: Amtsgericht München <span className="text-on-surface-muted/60">[TODO]</span></p>
            <p>{t("impressum.registerNumber")}: HRB XXXXXX <span className="text-on-surface-muted/60">[TODO]</span></p>
          </section>

          {/* VAT ID */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.vatId")}</h2>
            <p>{t("impressum.vatIdLabel")}: DE XXXXXXXXX <span className="text-on-surface-muted/60">[TODO]</span></p>
          </section>

          {/* Managing Director */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.managingDirector")}</h2>
            <p>[TODO: Name of Managing Director]</p>
          </section>

          {/* Responsible for Editorial Content — §18 Abs. 2 MStV */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.editorialResponsible")}</h2>
            <p>[TODO: Name]</p>
            <p>[TODO: Address]</p>
          </section>

          {/* EU Dispute Resolution — Art. 14 Abs. 1 ODR-VO */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.disputeResolution")}</h2>
            <p>{t("impressum.disputeResolutionText")}</p>
            <p>
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary-light transition-colors"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>{t("impressum.disputeResolutionNote")}</p>
          </section>

          {/* Liability for Content — §7 TMG */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.liabilityContent")}</h2>
            <p>{t("impressum.liabilityContentText")}</p>
          </section>

          {/* Liability for Links — §8-10 TMG */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.liabilityLinks")}</h2>
            <p>{t("impressum.liabilityLinksText")}</p>
          </section>

          {/* Copyright */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.copyright")}</h2>
            <p>{t("impressum.copyrightText")}</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-muted">
          <p>&copy; {new Date().getFullYear()} PRAGMA</p>
          <nav className="flex items-center gap-4">
            <Link href="/legal/impressum" className="hover:text-primary transition-colors font-medium text-on-surface">{t("impressum.title")}</Link>
            <Link href="/legal/datenschutz" className="hover:text-primary transition-colors">{t("privacy.title")}</Link>
            <Link href="/legal/agb" className="hover:text-primary transition-colors">{t("terms.title")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
