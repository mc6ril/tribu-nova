import type { Locale } from "@/shared/core/i18n";

import LegalPage from "@/domains/roots/presentation/legals";

export default async function LegalPageRoute({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} />;
}
