import type { Locale } from "@/shared/i18n/config";

const OG_LOCALE_BY_APP_LOCALE: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
};

/**
 * Maps app locale to Open Graph locale strings (e.g. fr_FR).
 */
export const getOpenGraphLocale = (locale: Locale): string => {
  return OG_LOCALE_BY_APP_LOCALE[locale];
};

/**
 * Other supported OG locales for the same site (href-free alternate hints for crawlers).
 */
export const getAlternateOpenGraphLocales = (locale: Locale): string[] => {
  return (Object.keys(OG_LOCALE_BY_APP_LOCALE) as Locale[])
    .filter((l) => l !== locale)
    .map((l) => OG_LOCALE_BY_APP_LOCALE[l]);
};
