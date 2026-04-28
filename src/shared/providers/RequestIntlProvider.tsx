import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { getIntlLocale, type Locale } from "@/shared/i18n";
import DocumentLang from "@/shared/providers/DocumentLang";

type RequestIntlProviderProps = {
  children: React.ReactNode;
};

const RequestIntlProvider = async ({ children }: RequestIntlProviderProps) => {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentLang lang={getIntlLocale(locale)} />
      <div className="app-root" lang={getIntlLocale(locale)}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
};

export default RequestIntlProvider;
