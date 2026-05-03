import type { Locale } from "@/shared/core/i18n";

declare module "use-intl" {
  // Module augmentation relies on interface merging.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface AppConfig {
    Locale: Locale;
  }
}
