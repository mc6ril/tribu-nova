/**
 * Sentry Edge runtime configuration (middleware, edge routes).
 */

import * as Sentry from "@sentry/nextjs";

const isSentryEnabled = process.env.NODE_ENV === "production";

if (isSentryEnabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

    sendDefaultPii: false,

    tracesSampleRate: 0.1,

    enableLogs: true,
  });
}
