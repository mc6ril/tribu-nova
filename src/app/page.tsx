import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { localeCookieName, resolveLocale } from "@/shared/i18n/config";

export default async function Home() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const locale = resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  redirect(`/${locale}`);
}
