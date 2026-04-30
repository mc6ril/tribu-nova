"use client";

import { NextIntlClientProvider } from "next-intl";

import {
  defaultLocale,
  getIntlLocale,
  matchSupportedLocale,
} from "@/shared/core/i18n";
import { messageCatalog } from "@/shared/i18n/messageCatalog";
import DocumentLang from "@/shared/providers/DocumentLang";

type StaticIntlProviderProps = {
  children: React.ReactNode;
  locale: string;
  messages?: Record<string, unknown>;
};

const StaticIntlProvider = ({
  children,
  locale,
  messages,
}: StaticIntlProviderProps) => {
  const resolvedLocale = matchSupportedLocale(locale) ?? defaultLocale;
  const resolvedMessages = messages ?? messageCatalog[resolvedLocale];
  const htmlLang = getIntlLocale(resolvedLocale);

  return (
    <NextIntlClientProvider
      locale={resolvedLocale}
      messages={resolvedMessages}
      timeZone="UTC"
    >
      <DocumentLang lang={htmlLang} />
      {children}
    </NextIntlClientProvider>
  );
};

export default StaticIntlProvider;
