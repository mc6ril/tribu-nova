import { isTheme, Theme } from "@/shared/constants/theme";
import {
  APP_COOKIE_KEYS,
  CookieSource,
  getCookie,
  updateCookie,
} from "@/shared/infrastructure/storage/cookies";

export const themeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;
export const themeCookieName = APP_COOKIE_KEYS.THEME;

export const getThemePreferenceFromCookie = (source?: CookieSource): Theme => {
  const rawTheme = getCookie(themeCookieName, source);
  return rawTheme && isTheme(rawTheme) ? rawTheme : "system";
};

export const persistThemeCookie = (theme: Theme): void => {
  if (typeof document === "undefined") {
    return;
  }

  updateCookie(themeCookieName, theme, {
    maxAgeSeconds: themeCookieMaxAgeSeconds,
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
};
