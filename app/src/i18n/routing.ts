import { defineRouting } from "next-intl/routing";

export const locales = [
  "en", "de", "el", "tr", "ar", "fr",
  "es", "it", "pt", "nl", "pl", "ru",
  "ja", "zh", "ko",
] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  el: "Ελληνικά",
  tr: "Türkçe",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
  ru: "Русский",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
};

export const rtlLocales: Locale[] = ["ar"];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localeDetection: true,
});
