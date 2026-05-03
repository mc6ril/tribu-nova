export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;
export const localeCookieName = "workbench-locale";

export const supportedLocales = ["fr", "en", "es"] as const;
export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "fr";

const localeToIntlMap: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
};

export const isSupportedLocale = (value: string): value is Locale => {
  return supportedLocales.includes(value as Locale);
};

const normalizeLocaleToken = (value: string): string => {
  return value.trim().toLowerCase().replace(/_/g, "-");
};

export const matchSupportedLocale = (value?: string | null): Locale | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = normalizeLocaleToken(value);

  if (isSupportedLocale(normalizedValue)) {
    return normalizedValue;
  }

  const baseLocale = normalizedValue.split("-")[0];
  return isSupportedLocale(baseLocale) ? baseLocale : null;
};

export const getIntlLocale = (locale: Locale): string => {
  return localeToIntlMap[locale];
};
