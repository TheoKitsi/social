import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, rtlLocales } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { SplashScreen } from "@/components/splash-screen";
import { CookieConsent } from "@/components/cookie-consent";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

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

  return (
    <div dir={dir}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SplashScreen>{children}</SplashScreen>
        <CookieConsent />
        <PWAInstallPrompt />
      </NextIntlClientProvider>
    </div>
  );
}
