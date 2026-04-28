import type { MetadataRoute } from "next";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import type { Locale } from "@/shared/i18n/config";
import { buildHomePath } from "@/shared/i18n/publicPaths";
import { getSiteUrl } from "@/shared/seo/siteUrl";

export const buildManifest = (
  locale: Locale,
  description: string
): MetadataRoute.Manifest => {
  const base = getSiteUrl();

  return {
    name: PRODUCT_BRAND_NAME,
    short_name: PRODUCT_BRAND_NAME,
    description,
    start_url: buildHomePath(locale),
    scope: buildHomePath(locale),
    display: "standalone",
    background_color: "#faf7f4",
    theme_color: "#2a1f1a",
    lang: locale,
    icons: [
      {
        src: new URL("/icon", base).toString(),
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
};
