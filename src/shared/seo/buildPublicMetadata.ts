import type { Metadata } from "next";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import type { Locale } from "@/shared/core/i18n";
import { getLanguageAlternates } from "@/shared/seo/languageAlternates";
import {
  getAlternateOpenGraphLocales,
  getOpenGraphLocale,
} from "@/shared/seo/ogLocale";
import { getSiteUrl } from "@/shared/seo/siteUrl";

type BuildPublicMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  pathname: string;
  buildPathForLocale: (locale: Locale) => string;
};

/**
 * Metadata for indexable public routes (canonical, Open Graph, Twitter).
 */
export const buildPublicMetadata = ({
  locale,
  title,
  description,
  pathname,
  buildPathForLocale,
}: BuildPublicMetadataInput): Metadata => {
  const base = getSiteUrl();
  const canonical = new URL(pathname, base).toString();
  const ogLocale = getOpenGraphLocale(locale);
  const manifestUrl = new URL(`/manifest/${locale}`, base).toString();
  const openGraphImageUrl = new URL(`/og/${locale}`, base).toString();

  return {
    title,
    description,
    manifest: manifestUrl,
    alternates: {
      canonical,
      languages: getLanguageAlternates(buildPathForLocale),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: PRODUCT_BRAND_NAME,
      locale: ogLocale,
      alternateLocale: getAlternateOpenGraphLocales(locale),
      type: "website",
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [openGraphImageUrl],
    },
  };
};
