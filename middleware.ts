import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import {
  defaultLocale,
  type Locale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
  matchSupportedLocale,
} from "@/shared/core/i18n";
import { requireNonEmptyEnv } from "@/shared/errors/programmingError";
import {
  buildPathForLocale,
  getLocaleFromPathname,
  localizeHref,
  routing,
  stripLocalePrefix,
} from "@/shared/i18n/routing";
import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
} from "@/shared/utils/authRedirect";
import { isProtectedRoute } from "@/shared/utils/routes";
import { hasSupabaseAuthCookie } from "@/shared/utils/supabaseAuthCookies";

const handleI18nRouting = createIntlMiddleware(routing);

const isRedirectResponse = (response: NextResponse): boolean => {
  return response.headers.has("location");
};

const resolveMiddlewareLocale = (
  request: NextRequest,
  pathname: string
): Locale => {
  const pathLocale = getLocaleFromPathname(pathname);
  if (pathLocale) {
    return pathLocale;
  }

  return (
    matchSupportedLocale(request.cookies.get(localeCookieName)?.value) ??
    defaultLocale
  );
};

const setLocaleCookie = (
  response: NextResponse,
  locale: Locale
): NextResponse => {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: localeCookieMaxAgeSeconds,
  });

  return response;
};

const createRedirectResponse = (
  request: NextRequest,
  href: string,
  locale: Locale
): NextResponse => {
  return setLocaleCookie(
    NextResponse.redirect(new URL(href, request.url)),
    locale
  );
};

/**
 * Create Supabase client for Edge Runtime (middleware).
 * Uses @supabase/ssr to handle sessions via cookies while preserving the
 * `next-intl` response (rewrite headers and locale cookie).
 */
const createSupabaseClientForMiddleware = (
  request: NextRequest,
  response: NextResponse
) => {
  const supabaseUrl = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Missing NEXT_PUBLIC_SUPABASE_URL for Supabase middleware client"
  );
  const supabasePublishableKey = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY for Supabase middleware client"
  );

  const supabaseResponse = response;

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
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response: supabaseResponse };
};

/**
 * Next.js middleware for route optimization (UX redirects).
 *
 * Security model:
 * - Authentication gating is enforced here (Edge) for protected routes.
 * - Authorization is enforced by database RLS (ultimate source of truth) and route-level loaders.
 *
 * This middleware provides:
 * - Locale routing, rewrites, detection, and cookie sync through `next-intl`
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
  const i18nResponse = handleI18nRouting(request);

  if (isRedirectResponse(i18nResponse)) {
    return i18nResponse;
  }

  const locale = resolveMiddlewareLocale(request, pathname);
  const normalizedPathname = stripLocalePrefix(pathname);
  const isPublicHome = normalizedPathname === PAGE_ROUTES.HOME;

  if (isPublicHome) {
    const code = request.nextUrl.searchParams.get("code");
    const type = request.nextUrl.searchParams.get("type");
    const next = request.nextUrl.searchParams.get("next");

    if (code) {
      const nextPath = sanitizeInternalRedirectPath(
        next,
        getAuthCodeRedirectTarget(type)
      );

      const callbackPath = buildAuthCallbackPath({
        code,
        nextPath,
        fallbackPath: getAuthCodeRedirectTarget(type),
      });

      return createRedirectResponse(
        request,
        localizeHref(callbackPath, locale),
        locale
      );
    }
  }

  const isAuthPage =
    normalizedPathname === AUTH_PAGE_ROUTES.SIGNIN ||
    normalizedPathname === AUTH_PAGE_ROUTES.SIGNUP;
  const isProtected = isProtectedRoute(pathname);

  if (!isAuthPage && !isProtected) {
    return i18nResponse;
  }

  const hasAuthCookie = hasSupabaseAuthCookie(
    request.cookies.getAll().map((cookie) => cookie.name)
  );

  if (!hasAuthCookie) {
    if (isProtected) {
      const signInUrl = new URL(
        buildPathForLocale(AUTH_PAGE_ROUTES.SIGNIN, locale),
        request.url
      );
      signInUrl.searchParams.set("redirect", normalizedPathname);
      return setLocaleCookie(NextResponse.redirect(signInUrl), locale);
    }

    return i18nResponse;
  }

  try {
    const { supabase, response } = createSupabaseClientForMiddleware(
      request,
      i18nResponse
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && isAuthPage) {
      return createRedirectResponse(
        request,
        buildPathForLocale(PAGE_ROUTES.WORKSPACE, locale),
        locale
      );
    }

    if (isProtected) {
      if (error || !user) {
        const signInUrl = new URL(
          buildPathForLocale(AUTH_PAGE_ROUTES.SIGNIN, locale),
          request.url
        );
        signInUrl.searchParams.set("redirect", normalizedPathname);
        return setLocaleCookie(NextResponse.redirect(signInUrl), locale);
      }

      if (!user.email_confirmed_at) {
        const signInUrl = new URL(
          buildPathForLocale(AUTH_PAGE_ROUTES.SIGNIN, locale),
          request.url
        );
        signInUrl.searchParams.set("unverified", "true");
        return setLocaleCookie(NextResponse.redirect(signInUrl), locale);
      }
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Authentication error:", error);
    return i18nResponse;
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
