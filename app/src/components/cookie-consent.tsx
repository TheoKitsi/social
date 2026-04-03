"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";

type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const CONSENT_KEY = "pragma-cookie-consent";

export function CookieConsent() {
  const t = useTranslations("legal.cookie");
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem(CONSENT_KEY);
      if (!existing) {
        // Adapt delay based on whether splash screen was shown
        const splashSeen = sessionStorage.getItem("pragma-splash-seen");
        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        const delay = splashSeen || prefersReduced ? 500 : 3200;
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  function saveConsent(consent: ConsentState) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShow(false);
  }

  function handleAcceptAll() {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  }

  function handleEssentialOnly() {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  }

  function handleSaveSelection() {
    saveConsent({
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cookie-banner"
          className="fixed bottom-0 left-0 right-0 z-[9000] p-4 md:p-6 safe-bottom"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        >
          <div className="max-w-3xl mx-auto rounded-[var(--radius-lg)] border border-border bg-surface-elevated/95 backdrop-blur-md shadow-[var(--shadow-xl)] p-5 md:p-6 space-y-4 max-h-[85dvh] overflow-y-auto">
            {/* Header */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-on-surface">
                {t("title")}
              </h3>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                {t("description")}{" "}
                <Link
                  href="/legal/datenschutz"
                  className="text-primary underline underline-offset-2 hover:text-primary-light transition-colors"
                >
                  {t("learnMore")}
                </Link>
              </p>
            </div>

            {/* Detailed toggles */}
            {showDetails && (
              <div className="space-y-3 pt-2 border-t border-border">
                {/* Essential — always on */}
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{t("essential")}</p>
                    <p className="text-xs text-on-surface-muted">{t("essentialDesc")}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="w-5 h-5 accent-primary rounded"
                  />
                </label>

                {/* Analytics */}
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{t("analytics")}</p>
                    <p className="text-xs text-on-surface-muted">{t("analyticsDesc")}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded"
                  />
                </label>

                {/* Marketing */}
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{t("marketing")}</p>
                    <p className="text-xs text-on-surface-muted">{t("marketingDesc")}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded"
                  />
                </label>
              </div>
            )}

            {/* Actions — TTDSG compliant: reject is equally prominent as accept */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={handleEssentialOnly}>
                {t("rejectAll")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (showDetails) {
                    handleSaveSelection();
                  } else {
                    setShowDetails(true);
                  }
                }}
              >
                {showDetails ? t("saveSelection") : t("customize")}
              </Button>

              <Button size="sm" onClick={handleAcceptAll}>
                {t("acceptAll")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
