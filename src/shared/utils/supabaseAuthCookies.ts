const SUPABASE_AUTH_COOKIE_NAME =
  /^(?:__Secure-|__Host-)?sb-.*-auth-token(?:\.\d+)?$/;

/**
 * Supabase auth cookies are stored under `sb-*auth-token` names and may be chunked.
 */
export const isSupabaseAuthCookieName = (name: string): boolean => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return false;
  }

  return SUPABASE_AUTH_COOKIE_NAME.test(trimmedName);
};

/**
 * Extract cookie names from a raw cookie header or `document.cookie` string.
 */
export const getCookieNames = (cookieHeader: string): string[] => {
  if (!cookieHeader.trim()) {
    return [];
  }

  return cookieHeader
    .split(";")
    .map((cookiePart) => cookiePart.trim())
    .filter(Boolean)
    .map((cookiePart) => {
      const separatorIndex = cookiePart.indexOf("=");

      return separatorIndex === -1
        ? cookiePart
        : cookiePart.slice(0, separatorIndex);
    });
};

/**
 * Check whether a cookie collection contains a Supabase auth token cookie.
 */
export const hasSupabaseAuthCookie = (
  cookieNames: Iterable<string>
): boolean => {
  for (const cookieName of cookieNames) {
    if (isSupabaseAuthCookieName(cookieName)) {
      return true;
    }
  }

  return false;
};

/**
 * Check for a Supabase auth cookie in a raw cookie header string.
 */
export const hasSupabaseAuthCookieInHeader = (
  cookieHeader: string
): boolean => {
  return hasSupabaseAuthCookie(getCookieNames(cookieHeader));
};
