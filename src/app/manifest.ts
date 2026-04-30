import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

import { defaultLocale } from "@/shared/core/i18n";
import { buildManifest } from "@/shared/seo/buildManifest";

/**
 * Default web app manifest (PWA install).
 * Prefer the localized manifest route (`/manifest/{locale}`) for public pages.
 */
const manifest = async (): Promise<MetadataRoute.Manifest> => {
  const tManifest = await getTranslations({
    locale: defaultLocale,
    namespace: "app.manifest",
  });
  return buildManifest(defaultLocale, tManifest("description"));
};

export default manifest;
