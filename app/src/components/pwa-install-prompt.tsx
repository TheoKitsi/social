"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pragma-pwa-install-dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't show if already dismissed or already installed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing so it doesn't clash with splash/cookie consent
      setTimeout(() => setShow(true), 5000);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="pwa-install"
          className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-4 right-4 z-[8000] md:left-auto md:right-6 md:max-w-sm"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        >
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated/95 backdrop-blur-md shadow-[var(--shadow-xl)] p-4 flex items-center gap-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 512 512"
                className="text-primary"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="32"
                  strokeLinejoin="round"
                >
                  <polyline points="120,140 210,256 120,372" />
                  <polyline points="392,140 302,256 392,372" />
                  <rect
                    x="238"
                    y="238"
                    width="36"
                    height="36"
                    transform="rotate(45 256 256)"
                    fill="currentColor"
                    stroke="none"
                  />
                </g>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">
                Install PRAGMA
              </p>
              <p className="text-xs text-on-surface-muted">
                Add to home screen for the full experience
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="text-on-surface-muted hover:text-on-surface transition-colors p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Dismiss"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
