import type { Locale } from "@/shared/i18n/config";

import Home from "@/domains/roots/presentation/home";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <Home locale={locale} />;
}
