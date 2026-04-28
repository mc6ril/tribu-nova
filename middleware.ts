import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { requireNonEmptyEnv } from "@/shared/errors/programmingError";
import {
  defaultLocale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
} from "@/shared/i18n/config";
import {
  getLocaleFromPathname,
  getResolvedPublicLocaleFromPathname,
  isDefaultLocalePublicPathname,
  localizePublicPathname,
} from "@/shared/i18n/publicPaths";
import { resolveRuntimeLocale } from "@/shared/i18n/runtimeLocale";
import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
} from "@/shared/utils/authRedirect";
import {
  isProtectedRoute,
  isPublicEntryRoute,
} from "@/shared/utils/routes";
import { hasSupabaseAuthCookie } from "@/shared/utils/supabaseAuthCookies";

const NEXT_INTL_LOCALE_HEADER_NAME = "X-NEXT-INTL-LOCALE";

const setLocaleCookie = (
  response: NextResponse,
  locale: string
): NextResponse => {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: localeCookieMaxAgeSeconds,
  });

  return response;
};

/**
 * Create Supabase client for Edge Runtime (middleware).
 * Uses @supabase/ssr to handle sessions via cookies.
 * Forwards `forwardHeaders` on every `NextResponse.next` so locale injection is preserved.
 */
const createSupabaseClientForMiddleware = (
  request: NextRequest,
  forwardHeaders: Headers
) => {
  const supabaseUrl = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Missing NEXT_PUBLIC_SUPABASE_URL for Supabase middleware client"
  );
  const supabasePublishableKey = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY for Supabase middleware client"
  );

  let supabaseResponse = NextResponse.next({
    request: {
      headers: forwardHeaders,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptions;
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request: {
            headers: forwardHeaders,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response: supabaseResponse };
};

const appendLocaleResponseCookies = (
  response: NextResponse,
  pathname: string,
  currentCookieLocale?: string
): NextResponse => {
  const resolvedPublicLocale = getResolvedPublicLocaleFromPathname(pathname);
  if (
    resolvedPublicLocale &&
    resolvedPublicLocale !== currentCookieLocale
  ) {
    return setLocaleCookie(response, resolvedPublicLocale);
  }

  return response;
};

/**
 * Next.js middleware for route optimization (UX redirects).
 *
 * Security model:
 * - Authentication gating is enforced here (Edge) for protected routes.
 * - Authorization is enforced by database RLS (ultimate source of truth) and route-level loaders.
 *
 * This middleware provides:
 * - Default-locale public URLs without redirect on `/`
 * - `X-NEXT-INTL-LOCALE` for `next-intl`
 * - UX optimization: early redirects for better user experience
 * - Route filtering: prevents loading unnecessary pages
 * - Email verification checks: redirects unverified users
 *
 * On error, fails open (allows access) - RLS will still protect data access.
 */
export const middleware = async (
  request: NextRequest
): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;
  const cookieLocale = request.cookies.get(localeCookieName)?.value;

  const acceptLanguage = request.headers.get("accept-language");
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const pathLocale = getLocaleFromPathname(pathname);
  const isPublicHome =
    normalizedPathname === PAGE_ROUTES.HOME ||
    (pathLocale !== null && normalizedPathname === `/${pathLocale}`);

  if (isPublicHome) {
    const code = request.nextUrl.searchParams.get("code");
    const type = request.nextUrl.searchParams.get("type");
    const next = request.nextUrl.searchParams.get("next");

    if (code) {
      const nextPath = sanitizeInternalRedirectPath(
        next,
        getAuthCodeRedirectTarget(type)
      );

      return appendLocaleResponseCookies(
        NextResponse.redirect(
          new URL(
            buildAuthCallbackPath({
              code,
              nextPath,
              fallbackPath: getAuthCodeRedirectTarget(type),
            }),
            request.url
          )
        ),
        pathname,
        cookieLocale
      );
    }
  }

  if (isPublicEntryRoute(pathname)) {
    if (
      !cookieLocale &&
      !pathLocale &&
      isDefaultLocalePublicPathname(pathname)
    ) {
      const initialPublicLocale = resolveRuntimeLocale({ acceptLanguage });

      if (initialPublicLocale !== defaultLocale) {
        const localizedPathname = localizePublicPathname(
          pathname,
          initialPublicLocale
        );
        const redirectUrl = new URL(localizedPathname, request.url);
        redirectUrl.search = request.nextUrl.search;

        return setLocaleCookie(
          NextResponse.redirect(redirectUrl),
          initialPublicLocale
        );
      }
    }

    return appendLocaleResponseCookies(
      NextResponse.next(),
      pathname,
      cookieLocale
    );
  }

  const resolvedLocale = resolveRuntimeLocale({
    cookieLocale,
    acceptLanguage,
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NEXT_INTL_LOCALE_HEADER_NAME, resolvedLocale);

  const isAuthPage =
    pathname === AUTH_PAGE_ROUTES.SIGNIN ||
    pathname === AUTH_PAGE_ROUTES.SIGNUP;
  const isProtected = isProtectedRoute(pathname);

  if (!isAuthPage && !isProtected) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  }

  const hasAuthCookie = hasSupabaseAuthCookie(
    request.cookies.getAll().map((cookie) => cookie.name)
  );

  if (!hasAuthCookie) {
    if (isProtected) {
      const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  }

  try {
    const { supabase, response } = createSupabaseClientForMiddleware(
      request,
      requestHeaders
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL(PAGE_ROUTES.WORKSPACE, request.url));
    }

    if (isProtected) {
      if (error || !user) {
        const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }

      if (!user.email_confirmed_at) {
        const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
        signInUrl.searchParams.set("unverified", "true");
        return NextResponse.redirect(signInUrl);
      }
    }

    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  } catch (error) {
    console.error("[Middleware] Authentication error:", error);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  }
};

/**
 * Middleware configuration.
 * Matches request paths except static assets and API (see matcher).
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
