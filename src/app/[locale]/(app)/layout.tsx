import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import { defaultLocale, matchSupportedLocale } from "@/shared/core/i18n";
import { redirect } from "@/shared/i18n/routing";

import { getServerSession } from "@/domains/auth/infrastructure/supabase/getServerSession";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = matchSupportedLocale(localeParam) ?? defaultLocale;

  const session = await getServerSession();
  if (!session) {
    redirect({ href: AUTH_PAGE_ROUTES.SIGNIN, locale });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
