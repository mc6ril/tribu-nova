import {
  APP_COOKIE_KEYS,
  updateCookie,
} from "../infrastructure/storage/cookies";
import type { Locale } from "./routing";
import { localeCookieMaxAgeSeconds, routing } from "./routing";

export { localeCookieMaxAgeSeconds };
export type { Locale } from "./routing";

export const defaultLocale: Locale = routing.defaultLocale;
export const supportedLocales = routing.locales;
export const localeCookieName: string = APP_COOKIE_KEYS.LOCALE;

export const supportedLocaleOptions: readonly {
  code: Locale;
  label: string;
}[] = Object.freeze([
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
]);

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

export const parseAcceptLanguageHeader = (
  headerValue?: string | null
): string[] => {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(",")
    .map((entry, index) => {
      const [languageRange, ...params] = entry.split(";");
      const qualityParam = params.find((param) =>
        param.trim().startsWith("q=")
      );
      const parsedQuality = qualityParam
        ? Number.parseFloat(qualityParam.split("=")[1] ?? "1")
        : 1;

      return {
        locale: languageRange?.trim() ?? "",
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        index,
      };
    })
    .filter((candidate) => candidate.locale.length > 0 && candidate.quality > 0)
    .sort((left, right) => {
      if (right.quality !== left.quality) {
        return right.quality - left.quality;
      }

      return left.index - right.index;
    })
    .map((candidate) => candidate.locale);
};

type ResolveLocaleInput = {
  preferredLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

export const resolveLocale = ({
  preferredLocale,
  cookieLocale,
  acceptLanguage,
}: ResolveLocaleInput): Locale => {
  const explicitLocale = matchSupportedLocale(preferredLocale);
  if (explicitLocale) {
    return explicitLocale;
  }

  const persistedLocale = matchSupportedLocale(cookieLocale);
  if (persistedLocale) {
    return persistedLocale;
  }

  for (const candidate of parseAcceptLanguageHeader(acceptLanguage)) {
    const matchedLocale = matchSupportedLocale(candidate);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return defaultLocale;
};

export const persistLocaleCookie = (locale: Locale): void => {
  if (typeof document === "undefined") {
    return;
  }

  updateCookie(localeCookieName, locale, {
    maxAgeSeconds: localeCookieMaxAgeSeconds,
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
};

export const getIntlLocale = (locale: Locale): string => {
  return localeToIntlMap[locale];
};
