import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import { defaultLocale, matchSupportedLocale } from "@/shared/core/i18n";
import { redirect } from "@/shared/i18n/routing";
import { createLoggerFactory } from "@/shared/observability";

import { getServerSession } from "@/domains/auth/infrastructure/supabase/getServerSession";

const logger = createLoggerFactory().forScope("app.auth-layout");

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
    logger.warn("Protected app route requested without a session", {
      function: "AppLayout",
      locale,
      redirectPath: AUTH_PAGE_ROUTES.SIGNIN,
    });

    redirect({ href: AUTH_PAGE_ROUTES.SIGNIN, locale });
  }

  const authenticatedSession = session;
  if (!authenticatedSession) {
    throw new Error("AppLayout expected a session after redirect.");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
