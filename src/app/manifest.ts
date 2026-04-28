import type { MetadataRoute } from "next";

import { defaultLocale } from "@/shared/i18n/config";
import { getStaticTranslator } from "@/shared/i18n/staticTranslator";
import { buildManifest } from "@/shared/seo/buildManifest";

/**
 * Default web app manifest (PWA install).
 * Prefer the localized manifest route (`/manifest/{locale}`) for public pages.
 */
const manifest = (): MetadataRoute.Manifest => {
  const tManifest = getStaticTranslator(defaultLocale, "app.manifest");
  return buildManifest(defaultLocale, tManifest("description"));
};

export default manifest;
