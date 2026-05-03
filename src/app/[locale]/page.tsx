import type { Locale } from "@/shared/core/i18n";

import Home from "@/domains/roots/presentation/home";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <Home locale={locale} />;
}
