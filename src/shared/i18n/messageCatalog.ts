import type { Locale } from "@/shared/core/i18n";
import messagesEn from "@/shared/i18n/messages/en.json";
import messagesEs from "@/shared/i18n/messages/es.json";
import messagesFr from "@/shared/i18n/messages/fr.json";

export type IntlMessages = typeof messagesFr;

export const messageCatalog = {
  fr: messagesFr,
  en: messagesEn,
  es: messagesEs,
} satisfies Record<Locale, IntlMessages>;
