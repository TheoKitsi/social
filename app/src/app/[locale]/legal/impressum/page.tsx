"use client";

import { useTranslations } from "next-intl";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function ImpressumPage() {
  const t = useTranslations("legal");

  return (
    <div className="min-h-dvh bg-secondary bg-grid">
      <PublicHeader showBack />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-16 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-on-surface mb-8 tracking-[var(--tracking-tight)]">
          {t("impressum.title")}
        </h1>

        <div className="space-y-8 text-on-surface-muted text-sm leading-relaxed">

          {/* §5 TMG — Company Information */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.companyInfo")}</h2>
            <p>{t("impressum.companyName")}</p>
            <p>{t("impressum.companyAddress")}</p>
            <p>{t("impressum.companyCity")}</p>
          </section>

          {/* Contact */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.contact")}</h2>
            <p>E-Mail: {t("impressum.email")}</p>
            <p>Telefon: {t("impressum.phone")}</p>
          </section>

          {/* Commercial Register */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.register")}</h2>
            <p>{t("impressum.registerCourt")}: {t("impressum.registerCourtValue")}</p>
            <p>{t("impressum.registerNumber")}: {t("impressum.registerNumberValue")}</p>
          </section>

          {/* VAT ID */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.vatId")}</h2>
            <p>{t("impressum.vatIdLabel")}: {t("impressum.vatIdValue")}</p>
          </section>

          {/* Managing Director */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.managingDirector")}</h2>
            <p>{t("impressum.managingDirectorName")}</p>
          </section>

          {/* Responsible for Editorial Content — §18 Abs. 2 MStV */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">{t("impressum.editorialResponsible")}</h2>
            <p>{t("impressum.editorialName")}</p>
            <p>{t("impressum.editorialAddress")}</p>
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

      <PublicFooter />
    </div>
  );
}
