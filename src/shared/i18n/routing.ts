import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import {
  defaultLocale,
  getIntlLocale,
  isSupportedLocale,
  type Locale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
  matchSupportedLocale,
  supportedLocales,
} from "@/shared/core/i18n";

export {
  defaultLocale,
  getIntlLocale,
  isSupportedLocale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
  matchSupportedLocale,
  supportedLocales,
};
export type { Locale };

export const routing = defineRouting({
  locales: supportedLocales,
  defaultLocale,
  localePrefix: "always",
  localeCookie: {
    name: localeCookieName,
    sameSite: "lax",
    path: "/",
    maxAge: localeCookieMaxAgeSeconds,
  },
  alternateLinks: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export const getLocaleFromPathname = (pathname: string): Locale | null => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && isSupportedLocale(firstSegment) ? firstSegment : null;
};

export const stripLocalePrefix = (pathname: string): string => {
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const locale = getLocaleFromPathname(normalizedPathname);

  if (!locale) {
    return normalizedPathname || PAGE_ROUTES.HOME;
  }

  const strippedPathname = normalizedPathname.slice(locale.length + 1);
  return strippedPathname || PAGE_ROUTES.HOME;
};

export const buildPathForLocale = (
  href: string,
  locale: Locale,
  options?: { forcePrefix?: boolean }
): string => {
  return getPathname({
    href,
    locale,
    forcePrefix: options?.forcePrefix,
  });
};

export const buildHomePath = (locale: Locale): string => {
  return buildPathForLocale(PAGE_ROUTES.HOME, locale);
};

export const buildPricingPath = (locale: Locale): string => {
  return buildPathForLocale(PAGE_ROUTES.PRICING, locale);
};

export const buildLegalPath = (locale: Locale): string => {
  return buildPathForLocale(PAGE_ROUTES.LEGAL, locale);
};

export const localizeHref = (href: string, locale: Locale): string => {
  const [pathname = PAGE_ROUTES.HOME, search = ""] = href.split("?");
  const localizedPathname = buildPathForLocale(pathname, locale);
  return search ? `${localizedPathname}?${search}` : localizedPathname;
};
