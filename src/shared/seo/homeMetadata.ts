import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import type { Locale } from "@/shared/core/i18n";
import {
  buildHomePath,
  buildLegalPath,
  buildPricingPath,
} from "@/shared/i18n/routing";
import { getLanguageAlternates } from "@/shared/seo/languageAlternates";
import {
  getAlternateOpenGraphLocales,
  getOpenGraphLocale,
} from "@/shared/seo/ogLocale";
import { getSiteUrl } from "@/shared/seo/siteUrl";

export const buildHomeMetadata = async (locale: Locale): Promise<Metadata> => {
  const tMetadata = await getTranslations({
    locale,
    namespace: "app.metadata",
  });
  const siteUrl = getSiteUrl();

  const appTitle = tMetadata("title");
  const appDescription = tMetadata("description");
  const titleTemplate = tMetadata("titleTemplate");
  const keywords = tMetadata("keywords")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const ogImageAlt = tMetadata("ogImageAlt");

  const ogLocale = getOpenGraphLocale(locale);
  const alternateOgLocales = getAlternateOpenGraphLocales(locale);
  const homePath = buildHomePath(locale);
  const homeUrl = new URL(homePath, siteUrl).toString();
  const manifestUrl = new URL(`/manifest/${locale}`, siteUrl).toString();
  const openGraphImageUrl = new URL(`/og/${locale}`, siteUrl).toString();

  return {
    metadataBase: siteUrl,
    title: {
      default: appTitle,
      template: titleTemplate || `%s | ${PRODUCT_BRAND_NAME}`,
    },
    description: appDescription,
    keywords,
    applicationName: appTitle,
    authors: [{ name: appTitle, url: siteUrl.origin }],
    creator: appTitle,
    manifest: manifestUrl,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: homeUrl,
      languages: getLanguageAlternates(buildHomePath),
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateOgLocales,
      url: homeUrl,
      siteName: appTitle,
      title: appTitle,
      description: appDescription,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: ogImageAlt || appTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: appTitle,
      description: appDescription,
      images: [openGraphImageUrl],
    },
    category: "productivity",
  };
};

export { buildLegalPath, buildPricingPath };
