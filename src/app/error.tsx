"use client";

import { useEffect } from "react";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import { buildHomePath } from "@/shared/i18n/publicPaths";
import { useRuntimeLocaleSnapshot } from "@/shared/i18n/useRuntimeLocaleSnapshot";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: Props) => {
  const locale = useRuntimeLocaleSnapshot();
  const copy = getFallbackMessages(locale).error;
  const homePath = buildHomePath(locale);

  useEffect(() => {
    console.error(error);
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

export default ErrorPage;
