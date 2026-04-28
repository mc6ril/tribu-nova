/**
 * Next.js instrumentation hook — registers Sentry for Node and Edge runtimes.
 */

import * as Sentry from "@sentry/nextjs";

const isSentryEnabled = process.env.NODE_ENV === "production";

export async function register(): Promise<void> {
  if (!isSentryEnabled) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

type OnRequestError = typeof Sentry.captureRequestError;

export const onRequestError: OnRequestError = isSentryEnabled
  ? Sentry.captureRequestError
  : (...args) => {
      void args;
    };
