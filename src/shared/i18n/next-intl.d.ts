import { routing } from "./routing";

declare module "next-intl" {
  type AppConfig = {
    Locale: (typeof routing.locales)[number];
  };
}
