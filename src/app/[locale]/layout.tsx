import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import {
  isSupportedLocale,
  type Locale,
  supportedLocales,
} from "@/shared/core/i18n";
import { resolveIntlLocale } from "@/shared/i18n/resolveIntlLocale";
import AppProvider from "@/shared/providers/AppProvider";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";

export const generateStaticParams = () => {
  return supportedLocales.map((locale) => ({ locale }));
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const intlLocale: Locale = await resolveIntlLocale(locale);

  setRequestLocale(intlLocale);

  return (
    <RequestIntlProvider locale={intlLocale}>
      <AppProvider>{children}</AppProvider>
    </RequestIntlProvider>
  );
}
