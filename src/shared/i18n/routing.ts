export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export const routing = Object.freeze({
  locales: ["fr", "en", "es"] as const,
  defaultLocale: "fr" as const,
  localePrefix: "as-needed" as const,
  localeCookie: {
    name: "workbench-locale",
    sameSite: "lax" as const,
    path: "/",
    maxAge: localeCookieMaxAgeSeconds,
  },
  alternateLinks: false,
  // Public URLs stay canonical until a locale is explicitly encoded in the URL.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
