import { NextResponse } from "next/server";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import {
  defaultLocale,
  isSupportedLocale,
  type Locale,
} from "@/shared/core/i18n";
import { buildPathForLocale } from "@/shared/i18n/routing";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

/**
 * Auth callback route handler for Supabase PKCE flow.
 * Exchanges the authorization code for a session, then redirects
 * to the target page (e.g., /auth/update-password after password reset).
 */

const resolveLocale = (value: string): Locale =>
  isSupportedLocale(value) ? value : defaultLocale;

const resolveNextPath = ({
  locale,
  nextPath,
}: {
  locale: Locale;
  nextPath: string | null;
}): string => {
  if (!nextPath) {
    return buildPathForLocale(PAGE_ROUTES.ACCOUNT, locale);
  }

  // Only allow relative redirects.
  if (!nextPath.startsWith("/")) {
    return buildPathForLocale(PAGE_ROUTES.ACCOUNT, locale);
  }

  // If the caller already provided a locale segment, keep it.
  if (isSupportedLocale(nextPath.split("/")[1] ?? "")) {
    return nextPath;
  }

  return buildPathForLocale(nextPath, locale);
};

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) => {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = url.searchParams.get("next");

  const redirectTo = resolveNextPath({ locale, nextPath });

  if (!code) {
    return NextResponse.redirect(
      new URL(buildPathForLocale(AUTH_PAGE_ROUTES.SIGNIN, locale), url)
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(buildPathForLocale(AUTH_PAGE_ROUTES.SIGNIN, locale), url)
    );
  }

  return NextResponse.redirect(new URL(redirectTo, url));
};
