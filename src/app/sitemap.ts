import type { MetadataRoute } from "next";

import { supportedLocales } from "@/shared/core/i18n";
import {
  buildHomePath,
  buildLegalPath,
  buildPricingPath,
} from "@/shared/i18n/routing";
import { getLanguageAlternates } from "@/shared/seo/languageAlternates";
import { getSiteUrl } from "@/shared/seo/siteUrl";

const publicPaths: {
  buildPath: (locale: (typeof supportedLocales)[number]) => string;
  priority: number;
}[] = [
  { buildPath: buildHomePath, priority: 1 },
  { buildPath: buildPricingPath, priority: 0.8 },
  { buildPath: buildLegalPath, priority: 0.6 },
];

const sitemap = (): MetadataRoute.Sitemap => {
  const base = getSiteUrl();
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of supportedLocales) {
    for (const { buildPath, priority } of publicPaths) {
      const path = buildPath(locale);
      entries.push({
        url: new URL(path, base).toString(),
        lastModified,
        changeFrequency: "weekly",
        priority,
        alternates: {
          languages: getLanguageAlternates(buildPath),
        },
      });
    }
  }

  return entries;
};

export default sitemap;
