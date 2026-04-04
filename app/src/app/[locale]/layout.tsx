import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, rtlLocales } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { SplashScreen } from "@/components/splash-screen";
import { CookieConsent } from "@/components/cookie-consent";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { Analytics } from "@/components/analytics";
import { FlagsProvider, type FeatureFlags } from "@/components/flags-provider";
import * as flags from "@/flags";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  // Resolve feature flags server-side
  const resolvedFlags: FeatureFlags = {
    aiOnboarding: await flags.aiOnboarding(),
    socialLogin: await flags.socialLogin(),
    showPlans: await flags.showPlans(),
    dataConnectors: await flags.dataConnectors(),
    matchTransparency: await flags.matchTransparency(),
    messageEmailNotifications: await flags.messageEmailNotifications(),
    personalityTest: await flags.personalityTest(),
    onboardingCtaVariant: await flags.onboardingCtaVariant(),
  };

  return (
    <div dir={dir}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <FlagsProvider flags={resolvedFlags}>
          <SplashScreen>{children}</SplashScreen>
          <CookieConsent />
          <PWAInstallPrompt />
          <Analytics />
        </FlagsProvider>
      </NextIntlClientProvider>
    </div>
  );
}
