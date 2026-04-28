import { notFound } from "next/navigation";

import { isSupportedLocale, type Locale } from "@/shared/i18n";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";

import { LocaleParamProvider } from "./_providers/locale-param-provider";

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

  return (
    <RequestIntlProvider>
      <LocaleParamProvider locale={locale as Locale}>{children}</LocaleParamProvider>
    </RequestIntlProvider>
  );
}

