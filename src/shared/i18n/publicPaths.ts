import { PAGE_ROUTES } from "@/shared/constants/routes";

import {
  defaultLocale,
  isSupportedLocale,
  type Locale,
  supportedLocales,
} from "./config";

const localePattern = supportedLocales.join("|");
const LEAF_ROUTES = [PAGE_ROUTES.PRICING, PAGE_ROUTES.LEGAL] as const;
const leafRoutePattern = LEAF_ROUTES.map((value) => value.slice(1)).join("|");

const explicitLocalePattern = new RegExp(
  `^/(${localePattern})(?:$|/(?:${leafRoutePattern})(?:/.*)?)`
);

const normalizePathname = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

/**
 * Public routes keep the default locale unprefixed (`/`, `/pricing`)
 * and use a locale prefix for secondary locales (`/en`, `/es`, ...).
 * App routes (workspace, auth, join, api) stay unprefixed.
 */
export const buildHomePath = (locale: Locale): string => {
  return locale === defaultLocale ? PAGE_ROUTES.HOME : `/${locale}`;
};

export const buildPricingPath = (locale: Locale): string => {
  return locale === defaultLocale ? PAGE_ROUTES.PRICING : `/${locale}${PAGE_ROUTES.PRICING}`;
};

export const buildLegalPath = (locale: Locale): string => {
  return `/${locale}${PAGE_ROUTES.LEGAL}`;
};

/**
 * Rewrites a public pathname to its locale-specific URL.
 * Non-public paths are returned unchanged.
 */
export const localizePublicPathname = (pathname: string, locale: Locale): string => {
  const normalizedPathname = normalizePathname(pathname);
  const explicitLocale = getLocaleFromPathname(normalizedPathname);

  if (explicitLocale) {
    const suffix = normalizedPathname.slice(explicitLocale.length + 1);

    return locale === defaultLocale ? suffix || PAGE_ROUTES.HOME : `/${locale}${suffix}`;
  }

  if (!isDefaultLocalePublicPathname(normalizedPathname)) {
    return normalizedPathname;
  }

  return locale === defaultLocale
    ? normalizedPathname
    : normalizedPathname === PAGE_ROUTES.HOME
      ? `/${locale}`
      : `/${locale}${normalizedPathname}`;
};

export const getLocaleFromPathname = (pathname: string): Locale | null => {
  const match = normalizePathname(pathname).match(explicitLocalePattern);
  if (!match?.[1]) {
    return null;
  }

  return isSupportedLocale(match[1]) ? match[1] : null;
};

export const isDefaultLocalePublicPathname = (pathname: string): boolean => {
  return normalizePathname(pathname) === PAGE_ROUTES.HOME;
};

export const getResolvedPublicLocaleFromPathname = (pathname: string): Locale | null => {
  const explicitLocale = getLocaleFromPathname(pathname);
  if (explicitLocale) {
    return explicitLocale;
  }

  return isDefaultLocalePublicPathname(pathname) ? defaultLocale : null;
};

