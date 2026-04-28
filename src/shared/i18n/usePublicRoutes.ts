"use client";

import { useLocale } from "@/shared/i18n";
import {
  buildHomePath,
  buildLegalPath,
  buildPricingPath,
} from "@/shared/i18n/publicPaths";

/**
 * Locale-aware URLs for public entry pages.
 */
export const usePublicRoutes = () => {
  const locale = useLocale();

  return {
    home: buildHomePath(locale),
    pricing: buildPricingPath(locale),
    legal: buildLegalPath(locale),
  };
};

