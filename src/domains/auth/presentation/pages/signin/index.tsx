"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Button from "@/shared/design-system/button";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { isAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";

import styles from "./styles.module.scss";

import { SignInSchema } from "@/domains/auth/core/usecases/user/signInUser";
import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";
import { useAuthRoutes } from "@/domains/auth/presentation/hooks/useAuthRoutes";
import { useSignIn } from "@/domains/auth/presentation/hooks/user/useSignIn";
import { useSignInWithGoogle } from "@/domains/auth/presentation/hooks/user/useSignInWithGoogle";
import { useResendVerificationEmail } from "@/domains/auth/presentation/hooks/verification/useResendVerificationEmail";

type SignInFormInput = z.infer<typeof SignInSchema>;

type Props = {
  redirectPath: string;
  isUnverifiedRedirect: boolean;
};

const resolveSignInError = (error: unknown): string | undefined => {
  if (!isAppError(error)) return undefined;
  switch (error.code) {
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return "invalidCredentials";
    case AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR:
      return "emailNotVerified";
    case AUTH_ERROR_CODES.INVALID_EMAIL:
      return "invalidEmail";
    default:
      return "generic";
  }
};

const SignInPage = ({ redirectPath, isUnverifiedRedirect }: Props) => {
  const t = useTranslations("pages.signin");
  const tFields = useTranslations("pages.signin.fields");

  const {
    error: signInError,
    isPending: isSignInPending,
    mutate: submitSignIn,
  } = useSignIn(redirectPath);
  const { isPending: isGoogleSignInPending, mutate: submitGoogleSignIn } =
    useSignInWithGoogle(redirectPath);
  const {
    isPending: isResendVerificationPending,
    isSuccess: didResendVerificationSucceed,
    mutate: resendVerificationEmail,
  } = useResendVerificationEmail();
  const authRoutes = useAuthRoutes();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInFormInput>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = useCallback(
    (data: SignInFormInput) => {
      submitSignIn(data);
    },
    [submitSignIn]
  );

  const handleResendVerification = useCallback(() => {
    const email = getValues("email");
    if (email) resendVerificationEmail(email);
  }, [getValues, resendVerificationEmail]);

  const handleGoogleSignIn = useCallback(() => {
    submitGoogleSignIn();
  }, [submitGoogleSignIn]);

  const formErrorKey = signInError
    ? resolveSignInError(signInError)
    : undefined;
  const formError = formErrorKey ? t(`errors.${formErrorKey}`) : undefined;

  const showUnverifiedBanner =
    isUnverifiedRedirect ||
    (signInError &&
      isAppError(signInError) &&
      signInError.code === AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR);

  return (
    <div className={styles["signin-page"]}>
      <div className={styles["signin-container"]}>
        <Title variant="h1" className={styles["signin-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["signin-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          method="post"
          error={formError}
          className={styles["signin-form"]}
          aria-label={t("buttonAriaLabel")}
        >
          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="email@exemple.com"
            error={translateAuthFieldError(errors.email, (k) => tFields(k))}
            autoComplete="email"
            required
          />

          <Input
            {...register("password")}
            type="password"
            label="Mot de passe"
            error={translateAuthFieldError(errors.password, (k) => tFields(k))}
            autoComplete="current-password"
            required
          />

          <div className={styles["signin-forgot-password"]}>
            <NextLink href={authRoutes.resetPassword}>
              {t("forgotPassword")}
            </NextLink>
          </div>

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={isSignInPending}
            aria-label={t("buttonAriaLabel")}
          />
        </Form>

        {showUnverifiedBanner && (
          <div className={styles["signin-resend-verification"]}>
            {didResendVerificationSucceed ? (
              <Text variant="small">{t("resendVerification.success")}</Text>
            ) : (
              <Button
                label={t("resendVerification.button")}
                variant="ghost"
                onClick={handleResendVerification}
                disabled={isResendVerificationPending}
                aria-label={t("resendVerification.buttonAriaLabel")}
              />
            )}
          </div>
        )}

        <div className={styles["signin-divider"]}>
          <span>{t("oauth.divider")}</span>
        </div>

        <Button
          label={t("oauth.googleButton")}
          variant="secondary"
          onClick={handleGoogleSignIn}
          fullWidth
          disabled={isGoogleSignInPending}
          aria-label={t("oauth.googleButtonAriaLabel")}
        />

        <Text variant="body" className={styles["signin-footer"]}>
          {t("footer")}{" "}
          <NextLink href={authRoutes.signup} className={styles["signin-link"]}>
            {t("footerLink")}
          </NextLink>
        </Text>
      </div>
    </div>
  );
};

export default SignInPage;
