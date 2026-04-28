import { createTranslator } from "use-intl/core";

import type { Locale } from "./config";
import { messageCatalog } from "./messageCatalog";

export const getStaticMessages = (locale: Locale) => {
  return messageCatalog[locale];
};

export type StaticTranslator = (
  key: string,
  values?: Record<string, unknown>
) => string;

export const getStaticTranslator = (locale: Locale, namespace?: string) => {
  return createTranslator({
    locale,
    messages: getStaticMessages(locale),
    namespace,
  } as never) as StaticTranslator;
};
