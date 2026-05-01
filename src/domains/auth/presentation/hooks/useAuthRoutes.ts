"use client";

import { useLocale } from "next-intl";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { isSupportedLocale } from "@/shared/core/i18n";
import { buildPathForLocale } from "@/shared/i18n/routing";

const localeHref = (route: string, locale: string): string => {
  const validLocale = isSupportedLocale(locale) ? locale : "fr";
  return buildPathForLocale(route, validLocale);
};

export const useAuthRoutes = () => {
  const locale = useLocale();
  return {
    signin: localeHref(AUTH_PAGE_ROUTES.SIGNIN, locale),
    signup: localeHref(AUTH_PAGE_ROUTES.SIGNUP, locale),
    resetPassword: localeHref(AUTH_PAGE_ROUTES.RESET_PASSWORD, locale),
    updatePassword: localeHref(AUTH_PAGE_ROUTES.UPDATE_PASSWORD, locale),
    verifyEmail: localeHref(AUTH_PAGE_ROUTES.VERIFY_EMAIL, locale),
    legal: localeHref(PAGE_ROUTES.LEGAL, locale),
  };
};
