import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import {
  defaultLocale,
  isSupportedLocale,
  type Locale,
} from "@/shared/i18n/config";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

const getResolvedLocale = (value: string): Locale => {
  return isSupportedLocale(value) ? value : defaultLocale;
};

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) => {
  const { locale: localeParam } = await params;
  const locale = getResolvedLocale(localeParam);
  const tMetadata = await getTranslations({
    locale,
    namespace: "app.metadata",
  });
  const title = tMetadata("title") || PRODUCT_BRAND_NAME;
  const subtitle = tMetadata("description") || "";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #2a1f1a 0%, #4a3b32 55%, #faf7f4 100%)",
        color: "#faf7f4",
        fontFamily: "system-ui, sans-serif",
        padding: 64,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 24,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          opacity: 0.95,
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.35,
          color: "#e8e0d9",
        }}
      >
        {subtitle}
      </div>
    </div>,
    { ...size }
  );
};

