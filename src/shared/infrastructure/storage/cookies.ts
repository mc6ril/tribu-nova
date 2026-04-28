import { routing } from "../../i18n/routing";

export const APP_COOKIE_KEYS = Object.freeze({
  LOCALE:
    routing.localeCookie && typeof routing.localeCookie === "object"
      ? (routing.localeCookie.name ?? "workbench-locale")
      : "workbench-locale",
  THEME: "workbench-theme",
  RUNTIME_CONFIG_OVERRIDES: "workbench-runtime-config-overrides",
  USER: "workbench-user",
});

type CookieKey = keyof typeof APP_COOKIE_KEYS;
type CookieName = (typeof APP_COOKIE_KEYS)[CookieKey];

export type CookieSource = {
  get(name: CookieName): { value?: string } | undefined;
};

type CookieWriteOptions = {
  path?: string;
  maxAgeSeconds?: number;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

const readCookieValueFromHeader = (
  cookieHeader: string,
  cookieName: CookieName
): string | undefined => {
  if (!cookieHeader.trim()) {
    return undefined;
  }

  const cookieParts = cookieHeader.split(";");

  for (const cookiePart of cookieParts) {
    const trimmedPart = cookiePart.trim();
    const separatorIndex = trimmedPart.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmedPart.slice(0, separatorIndex).trim();
    if (name !== cookieName) {
      continue;
    }

    return trimmedPart.slice(separatorIndex + 1);
  }

  return undefined;
};

const buildCookieString = (
  name: CookieName,
  value: string,
  options?: CookieWriteOptions
): string => {
  const cookieSegments = [
    `${name}=${value}`,
    `Path=${options?.path ?? "/"}`,
    `SameSite=${options?.sameSite ?? "Lax"}`,
  ];

  if (typeof options?.maxAgeSeconds === "number") {
    cookieSegments.push(`Max-Age=${options.maxAgeSeconds}`);
  }

  if (options?.secure) {
    cookieSegments.push("Secure");
  }

  return cookieSegments.join("; ");
};

export const getCookie = (
  name: CookieName,
  source?: CookieSource
): string | undefined => {
  const cookieSource =
    source ?? (typeof document === "undefined" ? undefined : document.cookie);

  if (!cookieSource) {
    return undefined;
  }

  if (typeof cookieSource === "string") {
    return readCookieValueFromHeader(cookieSource, name);
  }

  const cookieValue = cookieSource.get(name)?.value;
  return typeof cookieValue === "string" ? cookieValue : undefined;
};

export const updateCookie = (
  name: CookieName,
  value: string,
  options?: CookieWriteOptions
): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildCookieString(name, value, options);
};

export const resetCookie = (
  name: CookieName,
  options?: Omit<CookieWriteOptions, "maxAgeSeconds">
): void => {
  updateCookie(name, "", {
    ...options,
    maxAgeSeconds: 0,
  });
};

export const cleanupCookies = (): void => {
  Object.values(APP_COOKIE_KEYS).forEach((name) => {
    resetCookie(name);
  });
};
