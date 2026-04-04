"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

/**
 * Plausible analytics — only loads when user has accepted analytics cookies.
 * Reads consent from localStorage (set by CookieConsent component).
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var to enable.
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false);
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  useEffect(() => {
    if (!domain) return;

    function checkConsent() {
      try {
        const raw = localStorage.getItem("pragma-cookie-consent");
        if (!raw) return;
        const consent = JSON.parse(raw);
        setEnabled(consent.analytics === true);
      } catch {
        // no consent yet
      }
    }

    checkConsent();

    // Re-check when consent changes (custom event from cookie-consent component)
    window.addEventListener("storage", checkConsent);
    return () => window.removeEventListener("storage", checkConsent);
  }, [domain]);

  if (!enabled || !domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
