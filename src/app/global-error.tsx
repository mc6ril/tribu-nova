"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getIntlLocale } from "@/shared/i18n";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import { buildHomePath } from "@/shared/i18n/publicPaths";
import { useRuntimeLocaleSnapshot } from "@/shared/i18n/useRuntimeLocaleSnapshot";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalErrorContent = ({
  error,
  reset,
  locale,
}: Props & { locale: ReturnType<typeof useRuntimeLocaleSnapshot> }) => {
  const copy = getFallbackMessages(locale).globalError;
  const homePath = buildHomePath(locale);

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
      eyebrow={copy.eyebrow}
      statusLabel={copy.status}
      statusValue="500"
      title={copy.title}
      message={copy.message}
      detail={
        process.env.NODE_ENV === "development" ? error.message : undefined
      }
      actions={[
        {
          label: copy.primaryAction,
          ariaLabel: copy.primaryActionAriaLabel,
          onClick: reset,
          variant: "primary",
        },
        {
          label: copy.secondaryAction,
          ariaLabel: copy.secondaryActionAriaLabel,
          href: homePath,
          variant: "secondary",
        },
      ]}
    />
  );
};

const GlobalErrorPage = ({ error, reset }: Props) => {
  const locale = useRuntimeLocaleSnapshot();

  return (
    <html lang={getIntlLocale(locale)} suppressHydrationWarning>
      <body>
        <GlobalErrorContent error={error} reset={reset} locale={locale} />
      </body>
    </html>
  );
};

export default GlobalErrorPage;
