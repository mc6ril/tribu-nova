import type { IntlMessages } from "./messageCatalog";
import type { Locale } from "./routing";

const messageLoaders: Record<Locale, () => Promise<IntlMessages>> = {
  fr: async () => (await import("./messages/fr.json")).default,
  en: async () => (await import("./messages/en.json")).default,
  es: async () => (await import("./messages/es.json")).default,
};

export const loadMessages = async (locale: Locale): Promise<IntlMessages> => {
  return messageLoaders[locale]();
};
