"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { usePathLocale } from "@/shared/i18n/usePathLocale";
import StaticIntlProvider from "@/shared/providers/StaticIntlProvider";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorContent = ({ error, reset }: Props) => {
  const t = useTranslations("routeFallback.error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteFallbackPage
      tone="error"
      eyebrow={t("eyebrow")}
      statusLabel={t("status")}
      statusValue="500"
      title={t("title")}
      message={t("message")}
      detail={
        process.env.NODE_ENV === "development" ? error.message : undefined
      }
      actions={[
        {
          label: t("primaryAction"),
          ariaLabel: t("primaryActionAriaLabel"),
          onClick: reset,
          variant: "primary",
        },
        {
          label: t("secondaryAction"),
          ariaLabel: t("secondaryActionAriaLabel"),
          href: PAGE_ROUTES.HOME,
          variant: "secondary",
        },
      ]}
    />
  );
};

const ErrorPage = (props: Props) => {
  const locale = usePathLocale();

  return (
    <StaticIntlProvider locale={locale}>
      <ErrorContent {...props} />
    </StaticIntlProvider>
  );
};

export default ErrorPage;
