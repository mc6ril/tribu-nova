import { useLocale as useNextIntlLocale, useTranslations } from "next-intl";

import type { Locale } from "./routing";

export {
  defaultLocale,
  getIntlLocale,
  isSupportedLocale,
  localeCookieName,
  matchSupportedLocale,
  parseAcceptLanguageHeader,
  persistLocaleCookie,
  resolveLocale,
  supportedLocaleOptions,
  supportedLocales,
} from "./config";
export type { Locale } from "./routing";
export { useLocalePreference } from "./useLocalePreference";

export const useLocale = (): Locale => {
  return useNextIntlLocale() as Locale;
};

export type TranslationFunction = ReturnType<typeof useTranslations>;
export const useTranslation = useTranslations;
export { useTranslations };
