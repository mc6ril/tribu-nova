"use client";

import { useCallback, useMemo } from "react";

import { useRouter } from "@/shared/i18n/routing";
export type AppRouterNavigationOptions = {
  feedback?: "auto" | "none";
};

type NextNavigateOptions = {
  scroll?: boolean;
};

type AppRouterFeedbackOnlyOptions = AppRouterNavigationOptions;

const omitFeedback = <
  T extends { feedback?: AppRouterNavigationOptions["feedback"] },
>(
  options: T | undefined
): Omit<T, "feedback"> | undefined => {
  if (!options) {
    return undefined;
  }
  const { feedback: _f, ...rest } = options;
  return rest as Omit<T, "feedback">;
};

/**
 * App-wide locale-aware router wrapper.
 * Prefer this over `useRouter` from `next/navigation` in presentation code (see ESLint).
 * The optional `feedback` flag is kept for API compatibility but no longer drives
 * a separate client-side loading overlay; route `loading.tsx` fallbacks own the UX.
 */
export const useAppRouter = () => {
  const router = useRouter();

  const push = useCallback(
    (
      href: string,
      options?: NextNavigateOptions & AppRouterNavigationOptions
    ) => {
      const nextOpts = omitFeedback(options);
      if (nextOpts === undefined) {
        return router.push(href);
      }
      return router.push(href, nextOpts);
    },
    [router]
  );

  const replace = useCallback(
    (
      href: string,
      options?: NextNavigateOptions & AppRouterNavigationOptions
    ) => {
      const nextOpts = omitFeedback(options);
      if (nextOpts === undefined) {
        return router.replace(href);
      }
      return router.replace(href, nextOpts);
    },
    [router]
  );

  const back = useCallback(
    (_options?: AppRouterFeedbackOnlyOptions) => {
      return router.back();
    },
    [router]
  );

  const forward = useCallback(
    (_options?: AppRouterFeedbackOnlyOptions) => {
      return router.forward();
    },
    [router]
  );

  const refresh = useCallback(
    (_options?: AppRouterFeedbackOnlyOptions) => {
      return router.refresh();
    },
    [router]
  );

  return useMemo(
    () => ({
      back,
      forward,
      prefetch: router.prefetch,
      push,
      refresh,
      replace,
    }),
    [back, forward, push, refresh, replace, router]
  );
};
