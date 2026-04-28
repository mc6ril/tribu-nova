import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  localeCookieName,
  matchSupportedLocale,
  resolveLocale,
} from "./config";
import { loadMessages } from "./loadMessages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const explicitLocale = matchSupportedLocale(requestedLocale);

  if (explicitLocale) {
    return {
      locale: explicitLocale,
      messages: await loadMessages(explicitLocale),
    };
  }

  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
