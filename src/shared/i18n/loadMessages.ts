import type { Locale } from "@/shared/core/i18n";
import type { IntlMessages } from "@/shared/i18n/messageCatalog";

const messageLoaders: Record<Locale, () => Promise<IntlMessages>> = {
  fr: async () => (await import("@/shared/i18n/messages/fr.json")).default,
  en: async () => (await import("@/shared/i18n/messages/en.json")).default,
  es: async () => (await import("@/shared/i18n/messages/es.json")).default,
};

export const loadMessages = async (locale: Locale): Promise<IntlMessages> => {
  return messageLoaders[locale]();
};
