"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function shouldShowSplash() {
  if (typeof window === "undefined") return false;
  const seen = sessionStorage.getItem("pragma-splash-seen");
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  return !seen && !prefersReduced;
}

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(() => shouldShowSplash());

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("pragma-splash-seen", "1");
    }, 2600);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-secondary"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          >
            {/* Measurement grid (brand DNA) */}
            <div className="absolute inset-0 bg-grid opacity-40" />

            <div className="relative flex flex-col items-center gap-8">
              {/* Logo SVG with draw-on animation */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 512 512"
                className="overflow-visible"
              >
                <defs>
                  <linearGradient id="splash-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF79A8" />
                    <stop offset="100%" stopColor="#FF4081" />
                  </linearGradient>
                </defs>

                {/* Left sight-line — draws on */}
                <motion.path
                  d="M 136,136 L 216,136 L 296,256 L 216,376 L 136,376 L 216,256 Z"
                  fill="none"
                  stroke="url(#splash-g)"
                  strokeWidth="28"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 1.0, ease: "easeInOut" },
                    opacity: { duration: 0.2 },
                  }}
                />

                {/* Right sight-line — draws on with slight delay */}
                <motion.path
                  d="M 376,136 L 296,136 L 216,256 L 296,376 L 376,376 L 296,256 Z"
                  fill="none"
                  stroke="url(#splash-g)"
                  strokeWidth="28"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      duration: 1.0,
                      ease: "easeInOut",
                      delay: 0.15,
                    },
                    opacity: { duration: 0.2, delay: 0.15 },
                  }}
                />

                {/* Convergence diamond — fades in after lines complete */}
                <motion.rect
                  x="242"
                  y="242"
                  width="28"
                  height="28"
                  rx="4"
                  transform="rotate(45 256 256)"
                  fill="url(#splash-g)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.1,
                    ease: [0.175, 0.885, 0.32, 1.275],
                  }}
                />
              </svg>

              {/* App name */}
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-on-surface tracking-[0.15em]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
              >
                PRAGMA
              </motion.h1>

              {/* Tagline */}
              <motion.p
                className="text-sm text-on-surface-muted tracking-[0.1em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                Measured Compatibility
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content always rendered underneath */}
      {children}
    </>
  );
}
