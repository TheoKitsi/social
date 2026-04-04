"use client";

import { createContext, useContext } from "react";

/**
 * Client-side feature flags context.
 * Flags are resolved server-side and passed down via this provider.
 */

export interface FeatureFlags {
  aiOnboarding: boolean;
  socialLogin: boolean;
  showPlans: boolean;
  dataConnectors: boolean;
  matchTransparency: boolean;
  messageEmailNotifications: boolean;
  personalityTest: boolean;
  onboardingCtaVariant: "start" | "discover" | "begin";
}

export const defaultFlags: FeatureFlags = {
  aiOnboarding: true,
  socialLogin: true,
  showPlans: false,
  dataConnectors: false,
  matchTransparency: false,
  messageEmailNotifications: false,
  personalityTest: false,
  onboardingCtaVariant: "start",
};

const FlagsContext = createContext<FeatureFlags>(defaultFlags);

export function FlagsProvider({
  flags,
  children,
}: {
  flags: FeatureFlags;
  children: React.ReactNode;
}) {
  return (
    <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>
  );
}

export function useFlags(): FeatureFlags {
  return useContext(FlagsContext);
}
