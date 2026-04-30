import { getTranslations } from "next-intl/server";

import type { Locale } from "@/shared/core/i18n";
import { buildHomePath } from "@/shared/i18n/routing";
import { getSiteUrl } from "@/shared/seo/siteUrl";

/**
 * Server-only JSON-LD for the public home page (WebSite + Organization).
 */
const WebsiteJsonLd = async ({ locale }: { locale: Locale }) => {
  const tMetadata = await getTranslations({
    locale,
    namespace: "app.metadata",
  });
  const name = tMetadata("title");
  const description = tMetadata("description");
  const base = getSiteUrl();
  const siteUrl = base.origin;
  const homeUrl = new URL(buildHomePath(locale), base).toString();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        name,
        description,
        url: homeUrl,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "ReadAction",
          target: homeUrl,
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name,
        url: siteUrl,
      },
      {
        "@type": "WebApplication",
        "@id": `${homeUrl}#webapp`,
        name,
        description,
        url: homeUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: locale,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
};

export default WebsiteJsonLd;
