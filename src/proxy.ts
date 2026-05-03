import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  AUTHENTICATED_PUBLIC_REDIRECT_EXEMPT_ROUTES,
  AUTHENTICATED_PUBLIC_REDIRECT_ROUTES,
  PAGE_ROUTES,
} from "@/shared/constants/routes";
import { isSupportedLocale, type Locale } from "@/shared/core/i18n";
import { decodeAppSessionCookieValue } from "@/shared/infrastructure/auth/appSessionCookieValue";
import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

const routeMatches = (pathname: string, route: string): boolean => {
  return pathname === route || pathname.startsWith(`${route}/`);
};

const resolveLocalizedPublicRoute = (
  pathname: string
): { locale: Locale; routePath: string } | null => {
  const [localeSegment, ...routeSegments] = pathname.split("/").filter(Boolean);

  if (!isSupportedLocale(localeSegment)) {
    return null;
  }

  const routePath = routeSegments.length ? `/${routeSegments.join("/")}` : "/";

  return {
    locale: localeSegment,
    routePath,
  };
};

const isAuthenticatedPublicRedirectRoute = (routePath: string): boolean => {
  const isExempt = AUTHENTICATED_PUBLIC_REDIRECT_EXEMPT_ROUTES.some((route) =>
    routeMatches(routePath, route)
  );

  if (isExempt) {
    return false;
  }

  return AUTHENTICATED_PUBLIC_REDIRECT_ROUTES.some((route) =>
    routeMatches(routePath, route)
  );
};

const buildLocalizedRedirectPath = (
  locale: Locale,
  internalPath: string
): string => {
  const firstSegment = internalPath.split("/").filter(Boolean)[0];

  if (firstSegment && isSupportedLocale(firstSegment)) {
    return internalPath;
  }

  return internalPath === "/" ? `/${locale}` : `/${locale}${internalPath}`;
};

const getAuthenticatedPublicRedirectResponse = (
  request: NextRequest
): NextResponse | null => {
  const localizedRoute = resolveLocalizedPublicRoute(request.nextUrl.pathname);

  if (
    !localizedRoute ||
    !isAuthenticatedPublicRedirectRoute(localizedRoute.routePath)
  ) {
    return null;
  }

  const appSessionCookie = request.cookies.get(APP_COOKIE_KEYS.USER)?.value;
  if (!appSessionCookie || !decodeAppSessionCookieValue(appSessionCookie)) {
    return null;
  }

  const redirectTarget = sanitizeInternalRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
    PAGE_ROUTES.WORKSPACE
  );
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = buildLocalizedRedirectPath(
    localizedRoute.locale,
    redirectTarget
  );
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
};

export async function proxy(request: NextRequest) {
  const authenticatedPublicRedirect =
    getAuthenticatedPublicRedirectResponse(request);

  if (authenticatedPublicRedirect) {
    return authenticatedPublicRedirect;
  }

  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));

  if (!hasSupabaseAuthCookie) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // Cache-Control headers set by @supabase/ssr to prevent CDN caching of auth responses
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between createServerClient and getClaims().
  // getClaims() triggers token refresh. Removing it may cause random logouts.
  await supabase.auth.getClaims();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
