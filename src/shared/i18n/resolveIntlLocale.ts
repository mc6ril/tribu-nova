import { headers } from "next/headers";

import { type Locale, matchSupportedLocale } from "@/shared/core/i18n";
import { NEXT_INTL_LOCALE_HEADER } from "@/shared/i18n/nextIntlHeader";

/**
 * Prefer the locale from `next-intl` middleware over the `[locale]` segment
 * when the header is set — it matches the URL the user actually hit.
 */
export async function resolveIntlLocale(
  segmentLocale: Locale
): Promise<Locale> {
  try {
    const headerLocale = matchSupportedLocale(
      (await headers()).get(NEXT_INTL_LOCALE_HEADER)
    );
    if (headerLocale) {
      return headerLocale;
    }
  } catch {
    // `headers()` can be unavailable in some static contexts.
  }

  return segmentLocale;
}
