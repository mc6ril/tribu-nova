"use client";

import { useEffect, useMemo, useRef } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import Loader from "@/shared/design-system/loader";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";

import styles from "./styles.module.scss";

import { useAuthRoutes } from "@/domains/auth/presentation/hooks/useAuthRoutes";
import { useVerifyEmail } from "@/domains/auth/presentation/hooks/verification/useVerifyEmail";
import {
  getVerifyEmailRedirectErrorCode,
  parseVerifyEmailParams,
} from "@/domains/auth/presentation/utils/verifyEmail";

type Props = {
  searchParams: Record<string, string>;
};

const VerifyEmailPage = ({ searchParams }: Props) => {
  const t = useTranslations("pages.verifyEmail");
  const {
    mutate: verifyEmail,
    isPending: isVerifyEmailPending,
    isSuccess: isVerifyEmailSuccess,
    isError: isVerifyEmailError,
  } = useVerifyEmail();
  const authRoutes = useAuthRoutes();
  const hasTriggered = useRef(false);

  const params = useMemo(
    () => new URLSearchParams(Object.entries(searchParams)),
    [searchParams]
  );

  // Parse without hash for render states (redirectError, isMissingToken, shouldRecoverSession)
  const parsed = useMemo(() => parseVerifyEmailParams(params), [params]);

  useEffect(() => {
    if (hasTriggered.current) return;
    // Re-parse with hash for legacy token flows where Supabase puts the token in the fragment
    const hash = window.location.hash || undefined;
    const parsedWithHash = parseVerifyEmailParams(params, hash);
    if (!parsedWithHash.input) return;
    hasTriggered.current = true;
    verifyEmail(parsedWithHash.input);
  }, [params, verifyEmail]);

  const isLoading =
    isVerifyEmailPending ||
    (!parsed.redirectError &&
      !parsed.isMissingToken &&
      !parsed.shouldRecoverSession &&
      !isVerifyEmailError &&
      !isVerifyEmailSuccess);

  const redirectErrorCode = getVerifyEmailRedirectErrorCode(
    parsed.redirectError
  );

  const renderContent = () => {
    if (parsed.shouldRecoverSession || isVerifyEmailSuccess) {
      return (
        <>
          <div className={styles["verify-email-success"]}>
            <Text variant="body">{t("success")}</Text>
            <Text variant="small">{t("redirecting")}</Text>
          </div>
          <div className={styles["verify-email-footer"]}>
            <NextLink
              href={authRoutes.signin}
              className={styles["verify-email-link"]}
            >
              {t("backToSignin")}
            </NextLink>
          </div>
        </>
      );
    }

    if (parsed.redirectError || isVerifyEmailError) {
      const errorKey =
        redirectErrorCode === "INVALID_TOKEN"
          ? "invalidToken"
          : redirectErrorCode === "EMAIL_VERIFICATION_ERROR"
            ? "verificationError"
            : "generic";

      return (
        <>
          <div className={styles["verify-email-error"]}>
            <Text variant="small">{t(`errors.${errorKey}`)}</Text>
          </div>
          <div className={styles["verify-email-footer"]}>
            <NextLink
              href={authRoutes.signin}
              className={styles["verify-email-link"]}
            >
              {t("backToSignin")}
            </NextLink>
          </div>
        </>
      );
    }

    if (parsed.isMissingToken) {
      return (
        <>
          <div className={styles["verify-email-error"]}>
            <Text variant="small">{t("errors.missingToken")}</Text>
          </div>
          <div className={styles["verify-email-footer"]}>
            <NextLink
              href={authRoutes.signin}
              className={styles["verify-email-link"]}
            >
              {t("backToSignin")}
            </NextLink>
          </div>
        </>
      );
    }

    if (isLoading) {
      return <Loader variant="inline" size="medium" />;
    }

    return null;
  };

  return (
    <div className={styles["verify-email-page"]}>
      <div className={styles["verify-email-container"]}>
        <Title variant="h1" className={styles["verify-email-title"]}>
          {t("title")}
        </Title>
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
