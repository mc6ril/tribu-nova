import { type Locale, localeCookieName, resolveLocale } from "./config";
import { getResolvedPublicLocaleFromPathname } from "./publicPaths";

type ResolveRuntimeLocaleInput = {
  pathname?: string | null;
  cookieLocale?: string | null;
  cookieString?: string | null;
  acceptLanguage?: string | null;
};

export const readLocaleCookieValue = (
  cookieString?: string | null
): string | undefined => {
  if (!cookieString) {
    return undefined;
  }

  const localeCookie = cookieString
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${localeCookieName}=`));

  return localeCookie?.split("=")[1];
};

export const getBrowserAcceptLanguage = (): string | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  if (navigator.languages.length > 0) {
    return navigator.languages.join(",");
  }

  return navigator.language;
};

export const resolveRuntimeLocale = ({
  pathname,
  cookieLocale,
  cookieString,
  acceptLanguage,
}: ResolveRuntimeLocaleInput): Locale => {
  return resolveLocale({
    preferredLocale: pathname
      ? getResolvedPublicLocaleFromPathname(pathname)
      : null,
    cookieLocale: cookieLocale ?? readLocaleCookieValue(cookieString),
    acceptLanguage,
  });
};
