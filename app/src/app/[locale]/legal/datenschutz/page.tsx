"use client";

import { useTranslations } from "next-intl";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function DatenschutzPage() {
  const t = useTranslations("legal");

  return (
    <div className="min-h-dvh bg-secondary bg-grid">
      <PublicHeader showBack />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-16 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-[var(--tracking-tight)]">
          {t("privacy.title")}
        </h1>
        <p className="text-sm text-on-surface-muted mb-8">
          {t("privacy.lastUpdated")}: 03.04.2026
        </p>

        <div className="space-y-8 text-on-surface-muted text-sm leading-relaxed">

          {/* 1. Data Controller */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">1. {t("privacy.controller")}</h2>
            <p>{t("privacy.controllerText")}</p>
            <p>PRAGMA GmbH<br />Musterstraße 1<br />80331 München, Deutschland<br />E-Mail: datenschutz@pragma.app</p>
          </section>

          {/* 2. DPO */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">2. {t("privacy.dpo")}</h2>
            <p>{t("privacy.dpoText")}</p>
          </section>

          {/* 3. Data Categories */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">3. {t("privacy.dataCategories")}</h2>
            <p>{t("privacy.dataCategoriesText")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("privacy.categoryAccount")}</li>
              <li>{t("privacy.categoryProfile")}</li>
              <li>{t("privacy.categorySpecial")}</li>
              <li>{t("privacy.categoryUsage")}</li>
              <li>{t("privacy.categoryMessages")}</li>
              <li>{t("privacy.categoryPayment")}</li>
            </ul>
          </section>

          {/* 4. Special Category Data — Art. 9 GDPR */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">4. {t("privacy.specialData")}</h2>
            <p>{t("privacy.specialDataText")}</p>
          </section>

          {/* 5. Legal Basis */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">5. {t("privacy.legalBasis")}</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Art. 6(1)(a) DSGVO</strong> — {t("privacy.basisConsent")}</li>
              <li><strong>Art. 6(1)(b) DSGVO</strong> — {t("privacy.basisContract")}</li>
              <li><strong>Art. 6(1)(f) DSGVO</strong> — {t("privacy.basisLegitimate")}</li>
              <li><strong>Art. 9(2)(a) DSGVO</strong> — {t("privacy.basisSpecialConsent")}</li>
            </ul>
          </section>

          {/* 6. Purpose Limitation */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">6. {t("privacy.purposes")}</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("privacy.purposeMatching")}</li>
              <li>{t("privacy.purposeCommunication")}</li>
              <li>{t("privacy.purposeSecurity")}</li>
              <li>{t("privacy.purposeImprovement")}</li>
              <li>{t("privacy.purposeLegal")}</li>
            </ul>
          </section>

          {/* 7. Automated Decision-Making — Art. 22 GDPR */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">7. {t("privacy.automatedDecisions")}</h2>
            <p>{t("privacy.automatedDecisionsText")}</p>
          </section>

          {/* 8. Recipients / Third Parties */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">8. {t("privacy.recipients")}</h2>
            <p>{t("privacy.recipientsText")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("privacy.recipientHosting")}</li>
              <li>{t("privacy.recipientAuth")}</li>
              <li>{t("privacy.recipientPayment")}</li>
              <li>{t("privacy.recipientVerification")}</li>
            </ul>
          </section>

          {/* 9. International Transfers */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">9. {t("privacy.transfers")}</h2>
            <p>{t("privacy.transfersText")}</p>
          </section>

          {/* 10. Retention Periods */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">10. {t("privacy.retention")}</h2>
            <p>{t("privacy.retentionText")}</p>
          </section>

          {/* 11. Cookies */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">11. {t("privacy.cookies")}</h2>
            <p>{t("privacy.cookiesText")}</p>
          </section>

          {/* 12. Your Rights — Art. 15-21 GDPR */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">12. {t("privacy.rights")}</h2>
            <p>{t("privacy.rightsIntro")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Art. 15</strong> — {t("privacy.rightAccess")}</li>
              <li><strong>Art. 16</strong> — {t("privacy.rightRectification")}</li>
              <li><strong>Art. 17</strong> — {t("privacy.rightErasure")}</li>
              <li><strong>Art. 18</strong> — {t("privacy.rightRestriction")}</li>
              <li><strong>Art. 20</strong> — {t("privacy.rightPortability")}</li>
              <li><strong>Art. 21</strong> — {t("privacy.rightObjection")}</li>
            </ul>
          </section>

          {/* 13. Supervisory Authority */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-on-surface">13. {t("privacy.supervisory")}</h2>
            <p>{t("privacy.supervisoryText")}</p>
            <p>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
               Promenade 18<br />
               91522 Ansbach</p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
