import messagesEn from "./messages/en.json";
import messagesEs from "./messages/es.json";
import messagesFr from "./messages/fr.json";
import type { Locale } from "./routing";

export type IntlMessages = typeof messagesFr;

export const messageCatalog = {
  fr: messagesFr,
  en: messagesEn,
  es: messagesEs,
} satisfies Record<Locale, IntlMessages>;
