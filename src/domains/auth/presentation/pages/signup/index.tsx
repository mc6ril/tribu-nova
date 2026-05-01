"use client";

import { useCallback, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import { isSupportedLocale } from "@/shared/core/i18n";
import Button from "@/shared/design-system/button";
import Checkbox from "@/shared/design-system/checkbox";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { isAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";

import styles from "./styles.module.scss";

import PasswordStrengthIndicator from "@/domains/auth/presentation/components/PasswordStrengthIndicator";
import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";
import {
  type SignUpFormInput,
  SignUpFormSchema,
} from "@/domains/auth/presentation/forms/authForms.schema";
import { useAuthRoutes } from "@/domains/auth/presentation/hooks/useAuthRoutes";
import { useSignInWithGoogle } from "@/domains/auth/presentation/hooks/user/useSignInWithGoogle";
import { useSignUp } from "@/domains/auth/presentation/hooks/user/useSignUp";
import { useResendVerificationEmail } from "@/domains/auth/presentation/hooks/verification/useResendVerificationEmail";

type Props = {
  redirectPath: string;
};

const resolveSignUpError = (error: unknown): string | undefined => {
  if (!isAppError(error)) return undefined;
  switch (error.code) {
    case AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS:
    case AUTH_ERROR_CODES.INVALID_EMAIL:
      return "invalidEmail";
    case AUTH_ERROR_CODES.WEAK_PASSWORD:
      return "weakPassword";
    default:
      return "generic";
  }
};

const SignUpPage = ({ redirectPath }: Props) => {
  const t = useTranslations("pages.signup");
  const tFields = useTranslations("pages.signup.fields");
  const rawLocale = useLocale();
  const locale = isSupportedLocale(rawLocale) ? rawLocale : "fr";

  const signUp = useSignUp(redirectPath);
  const signInWithGoogle = useSignInWithGoogle(redirectPath);
  const resendVerification = useResendVerificationEmail();
  const authRoutes = useAuthRoutes();

  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(SignUpFormSchema),
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = useCallback(
    (data: SignUpFormInput) => {
      setVerificationEmail(data.email);
      signUp.mutate({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        termsAcceptedAt: new Date().toISOString(),
        locale,
      });
    },
    [signUp, locale]
  );

  const handleGoogleSignIn = useCallback(() => {
    signInWithGoogle.mutate();
  }, [signInWithGoogle]);

  const handleResendVerification = useCallback(() => {
    if (verificationEmail) resendVerification.mutate(verificationEmail);
  }, [resendVerification, verificationEmail]);

  const isVerificationRequired =
    signUp.isSuccess && signUp.data.requiresEmailVerification === true;

  if (isVerificationRequired) {
    return (
      <div className={styles["signup-page"]}>
        <div className={styles["signup-container"]}>
          <Title variant="h1" className={styles["signup-title"]}>
            {t("verification.title")}
          </Title>
          <Text variant="body" className={styles["signup-verification-hint"]}>
            {t("verification.message")}
          </Text>
          <Text variant="body" className={styles["signup-verification-hint"]}>
            {t("verification.instructions")}
          </Text>
          <Text variant="small" className={styles["signup-verification-hint"]}>
            {t("verification.resendHint")}
          </Text>

          <div className={styles["signup-verification-actions"]}>
            {resendVerification.isSuccess ? (
              <Text
                variant="small"
                className={styles["signup-verification-feedback--success"]}
              >
                {t("verification.resendSuccess")}
              </Text>
            ) : (
              <Button
                label={t("verification.resendButton")}
                variant="secondary"
                onClick={handleResendVerification}
                disabled={resendVerification.isPending}
                aria-label={t("verification.resendButtonAriaLabel")}
              />
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <NextLink href={authRoutes.signin}>
              {t("verification.backToSignin")}
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const formErrorKey = signUp.error
    ? resolveSignUpError(signUp.error)
    : undefined;
  const formError = formErrorKey ? t(`errors.${formErrorKey}`) : undefined;

  return (
    <div className={styles["signup-page"]}>
      <div className={styles["signup-container"]}>
        <Title variant="h1" className={styles["signup-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["signup-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          error={formError}
          className={styles["signup-form"]}
          aria-label={t("buttonAriaLabel")}
        >
          <Input
            {...register("displayName")}
            type="text"
            label={tFields("displayName.label")}
            placeholder={tFields("displayName.placeholder")}
            autoComplete="name"
          />

          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="email@exemple.com"
            error={translateAuthFieldError(errors.email, (k) => tFields(k))}
            autoComplete="email"
            required
          />

          <div className={styles["signup-password-group"]}>
            <Input
              {...register("password")}
              type="password"
              label="Mot de passe"
              error={translateAuthFieldError(errors.password, (k) =>
                tFields(k)
              )}
              helperText={tFields("password.helperText")}
              autoComplete="new-password"
              required
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <Input
            {...register("confirmPassword")}
            type="password"
            label={tFields("confirmPassword.label")}
            error={translateAuthFieldError(errors.confirmPassword, (k) =>
              tFields(k)
            )}
            autoComplete="new-password"
            required
          />

          <div className={styles["signup-terms"]}>
            <Controller
              name="acceptedTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={tFields("acceptedTerms.label")}
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  aria-label={tFields("acceptedTerms.ariaLabel")}
                  required
                />
              )}
            />
            <Text variant="body">
              {tFields("acceptedTerms.label")}{" "}
              <NextLink
                href={authRoutes.legal}
                className={styles["signup-terms__link"]}
              >
                {tFields("acceptedTerms.linkLabel")}
              </NextLink>
            </Text>
            {errors.acceptedTerms && (
              <p className={styles["signup-terms__error"]}>
                {errors.acceptedTerms.message}
              </p>
            )}
          </div>

          <Button
            label={signUp.isPending ? t("buttonLoading") : t("button")}
            type="submit"
            fullWidth
            disabled={signUp.isPending}
            aria-label={t("buttonAriaLabel")}
          />
        </Form>

        <div className={styles["signup-divider"]}>
          <span>{t("oauth.divider")}</span>
        </div>

        <Button
          label={t("oauth.googleButton")}
          variant="secondary"
          onClick={handleGoogleSignIn}
          fullWidth
          disabled={signInWithGoogle.isPending}
          aria-label={t("oauth.googleButtonAriaLabel")}
        />

        <p className={styles["signup-footer"]}>
          {t("footer")}{" "}
          <NextLink href={authRoutes.signin} className={styles["signup-link"]}>
            {t("footerLink")}
          </NextLink>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
