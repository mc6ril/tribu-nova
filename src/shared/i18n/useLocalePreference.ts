import { startTransition, useCallback } from "react";
import { useLocale } from "next-intl";

import { useAppRouter } from "@/shared/navigation/useAppRouter";

import { persistLocaleCookie } from "./config";
import type { Locale } from "./routing";

export const useLocalePreference = () => {
  const router = useAppRouter();
  const activeLocale = useLocale();

  return useCallback(
    (locale: Locale) => {
      if (locale === activeLocale) {
        return false;
      }

      persistLocaleCookie(locale);
      startTransition(() => {
        router.refresh();
      });

      return true;
    },
    [activeLocale, router]
  );
};
