import { cookies } from "next/headers";

import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import { defaultLocale, matchSupportedLocale } from "@/shared/core/i18n";
import { redirect } from "@/shared/i18n/routing";
import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = matchSupportedLocale(localeParam) ?? defaultLocale;
  const cookieStore = await cookies();

  const userCookie = cookieStore.get(APP_COOKIE_KEYS.USER)?.value;
  if (!userCookie) {
    redirect({ href: AUTH_PAGE_ROUTES.SIGNIN, locale });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
