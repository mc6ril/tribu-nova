/**
 * Sentry client (browser) initialization for Next.js App Router.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

const isSentryEnabled = process.env.NODE_ENV === "production";

if (isSentryEnabled) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    sendDefaultPii: false,

    tracesSampleRate: 0.1,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    enableLogs: true,

    integrations: [Sentry.replayIntegration()],
  });
}

type OnRouterTransitionStart = typeof Sentry.captureRouterTransitionStart;

export const onRouterTransitionStart: OnRouterTransitionStart = isSentryEnabled
  ? Sentry.captureRouterTransitionStart
  : (...args) => {
      void args;
    };
