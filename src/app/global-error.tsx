"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { getIntlLocale } from "@/shared/core/i18n";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { usePathLocale } from "@/shared/i18n/usePathLocale";
import StaticIntlProvider from "@/shared/providers/StaticIntlProvider";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalErrorContent = ({ error, reset }: Props) => {
  const t = useTranslations("routeFallback.globalError");

  useEffect(() => {
    console.error(error);
    if (error.digest) {
      Sentry.captureException(error, {
        tags: { nextDigest: error.digest },
      });
    } else {
      Sentry.captureException(error);
    }
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

const GlobalErrorPage = ({ error, reset }: Props) => {
  const locale = usePathLocale();

  return (
    <html lang={getIntlLocale(locale)} suppressHydrationWarning>
      <body>
        <StaticIntlProvider locale={locale}>
          <GlobalErrorContent error={error} reset={reset} />
        </StaticIntlProvider>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
