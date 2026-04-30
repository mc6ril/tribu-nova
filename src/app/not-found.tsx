"use client";

import { useTranslations } from "next-intl";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { getIntlLocale } from "@/shared/core/i18n";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { usePathLocale } from "@/shared/i18n/usePathLocale";
import StaticIntlProvider from "@/shared/providers/StaticIntlProvider";

const NotFoundContent = () => {
  const t = useTranslations("routeFallback.notFound");

  return (
    <RouteFallbackPage
      tone="notFound"
      eyebrow={t("eyebrow")}
      statusLabel={t("status")}
      statusValue="404"
      title={t("title")}
      message={t("message")}
      actions={[
        {
          label: t("primaryAction"),
          ariaLabel: t("primaryActionAriaLabel"),
          href: PAGE_ROUTES.HOME,
          variant: "primary",
        },
        {
          label: t("secondaryAction"),
          ariaLabel: t("secondaryActionAriaLabel"),
          href: PAGE_ROUTES.WORKSPACE,
          variant: "secondary",
        },
      ]}
    />
  );
};

const NotFoundPage = () => {
  const locale = usePathLocale();

  return (
    <StaticIntlProvider locale={locale}>
      <div className="app-root" lang={getIntlLocale(locale)}>
        <NotFoundContent />
      </div>
    </StaticIntlProvider>
  );
};

export default NotFoundPage;
