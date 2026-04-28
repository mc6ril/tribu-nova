import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

import {
  defaultLocale,
  isSupportedLocale,
  type Locale,
} from "@/shared/i18n/config";
import { buildManifest } from "@/shared/seo/buildManifest";

type Params = {
  locale: string;
};

export const GET = async (
  _request: Request,
  { params }: { params: Promise<Params> }
) => {
  const { locale } = await params;
  const resolvedLocale: Locale = isSupportedLocale(locale)
    ? locale
    : defaultLocale;
  const tManifest = await getTranslations({
    locale: resolvedLocale,
    namespace: "app.manifest",
  });
  const manifest = buildManifest(resolvedLocale, tManifest("description"));

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
};

