import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, matchSupportedLocale } from "@/shared/core/i18n";
import { loadMessages } from "@/shared/i18n/loadMessages";
import { NEXT_INTL_LOCALE_HEADER } from "@/shared/i18n/nextIntlHeader";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  let headerLocale = null;
  try {
    headerLocale = matchSupportedLocale(
      (await headers()).get(NEXT_INTL_LOCALE_HEADER)
    );
  } catch {
    /* static / edge cases without request headers */
  }

  const segmentLocale = matchSupportedLocale(locale ?? (await requestLocale));
  const resolvedLocale = headerLocale ?? segmentLocale ?? defaultLocale;

  return {
    locale: resolvedLocale,
    messages: await loadMessages(resolvedLocale),
  };
});
