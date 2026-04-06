"use client";

import { useTranslations } from "next-intl";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function AGBPage() {
  const t = useTranslations("legal");

  return (
    <div className="min-h-dvh bg-secondary bg-grid">
      <PublicHeader showBack />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-16 animate-fade-in-up">
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

      <PublicFooter />
    </div>
  );
}
