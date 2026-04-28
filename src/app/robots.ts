import type { MetadataRoute } from "next";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { getSiteUrl } from "@/shared/seo/siteUrl";

const robots = (): MetadataRoute.Robots => {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: PAGE_ROUTES.HOME,
        disallow: [
          "/api/",
          "/monitoring",
          "/auth/",
          PAGE_ROUTES.WORKSPACE,
          PAGE_ROUTES.ACCOUNT,
          "/join/",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", base).toString(),
    host: base.host,
  };
};

export default robots;
