"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { useToastStore } from "@/shared/stores/useToastStore";

import { useAcceptInvitation } from "@/domains/project/presentation/hooks/invitation/useAcceptInvitation";

type Props = {
  token: string;
};

const JoinInvitationPage = ({ token }: Props) => {
  const router = useAppRouter();
  const t = useTranslations("pages.join");
  const { addToast } = useToastStore();

  const acceptInvitationMutation = useAcceptInvitation();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current || !token) return;

    hasStartedRef.current = true;
    acceptInvitationMutation
      .mutateAsync(token)
      .then((result) => {
        router.replace(`/${result.projectId}/board`);
      })
      .catch(() => {
        addToast({
          message: t("errorMessage"),
          variant: "error",
          duration: 6000,
        });
        router.replace(PAGE_ROUTES.WORKSPACE);
      });
  }, [acceptInvitationMutation, addToast, router, t, token]);

  if (!token) {
    return (
      <RouteFallbackPage
        tone="error"
        eyebrow={t("errorEyebrow")}
        statusLabel={t("errorStatus")}
        statusValue={t("errorStatusValue")}
        title={t("errorTitle")}
        message={t("errorMessage")}
        actions={[
          {
            label: t("backToWorkspace"),
            ariaLabel: t("backToWorkspaceAriaLabel"),
            href: PAGE_ROUTES.WORKSPACE,
          },
        ]}
      />
    );
  }

  return (
    <RouteFallbackPage
      tone="loading"
      eyebrow={t("processingEyebrow")}
      statusLabel={t("processingStatus")}
      title={t("processingTitle")}
      message={t("processingMessage")}
      detail={t("processingDetail")}
      ariaLabel={t("processingAriaLabel")}
    />
  );
};

export default JoinInvitationPage;
