import {
  defaultLocale,
  type Locale,
  supportedLocales,
} from "@/shared/core/i18n";
import { getSiteUrl } from "@/shared/seo/siteUrl";

type Hreflang = Locale | "x-default";

/**
 * hreflang map for a public route.
 * All supported locales keep their URL prefix.
 */
export const getLanguageAlternates = (
  buildPathForLocale: (locale: Locale) => string
): Record<Hreflang, string> => {
  const base = getSiteUrl();
  const xDefault = new URL(buildPathForLocale(defaultLocale), base).toString();
  const localeAlternates = Object.fromEntries(
    supportedLocales.map((locale) => [
      locale,
      new URL(buildPathForLocale(locale), base).toString(),
    ])
  ) as Record<Locale, string>;

  return {
    "x-default": xDefault,
    ...localeAlternates,
  };
};
