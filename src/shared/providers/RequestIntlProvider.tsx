import { NextIntlClientProvider } from "next-intl";

import { getIntlLocale, type Locale } from "@/shared/core/i18n";
import { loadMessages } from "@/shared/i18n/loadMessages";
import DocumentLang from "@/shared/providers/DocumentLang";

type RequestIntlProviderProps = {
  children: React.ReactNode;
  /** Locale from `[locale]` URL segment — source of truth for client `useTranslations`. */
  locale: Locale;
};

const RequestIntlProvider = async ({
  children,
  locale,
}: RequestIntlProviderProps) => {
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <DocumentLang lang={getIntlLocale(locale)} />
      <div className="app-root" lang={getIntlLocale(locale)}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
};

export default RequestIntlProvider;
