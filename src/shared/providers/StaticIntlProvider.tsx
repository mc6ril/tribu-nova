"use client";

import { IntlProvider } from "use-intl";

import { getIntlLocale, matchSupportedLocale } from "@/shared/i18n";
import DocumentLang from "@/shared/providers/DocumentLang";

type StaticIntlProviderProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
};

const StaticIntlProvider = ({
  children,
  locale,
  messages,
}: StaticIntlProviderProps) => {
  const matchedLocale = matchSupportedLocale(locale);
  const htmlLang = matchedLocale ? getIntlLocale(matchedLocale) : locale;

  return (
    <IntlProvider locale={locale} messages={messages} timeZone="UTC">
      <DocumentLang lang={htmlLang} />
      {children}
    </IntlProvider>
  );
};

export default StaticIntlProvider;
