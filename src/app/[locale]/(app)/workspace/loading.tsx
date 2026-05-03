import { getTranslations } from "next-intl/server";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";

export default async function WorkspaceLoading() {
  const t = await getTranslations("pages.fallback");

  return (
    <RouteFallbackPage
      tone="loading"
      eyebrow={t("workspaceLoading.eyebrow")}
      statusLabel={t("workspaceLoading.status")}
      title={t("workspaceLoading.title")}
      message={t("workspaceLoading.message")}
      ariaLabel={t("workspaceLoading.ariaLabel")}
    />
  );
}
