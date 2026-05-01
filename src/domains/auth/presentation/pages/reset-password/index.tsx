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

import styles from "./styles.module.scss";

import { ResetPasswordSchema } from "@/domains/auth/core/usecases/password/resetPasswordForEmail";
import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";
import { useResetPasswordForEmail } from "@/domains/auth/presentation/hooks/password/useResetPasswordForEmail";
import { useAuthRoutes } from "@/domains/auth/presentation/hooks/useAuthRoutes";

type ResetPasswordFormInput = z.infer<typeof ResetPasswordSchema>;

const ResetPasswordPage = () => {
  const t = useTranslations("pages.resetPassword");
  const tFields = useTranslations("pages.resetPassword.fields");

  const resetPassword = useResetPasswordForEmail();
  const authRoutes = useAuthRoutes();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = useCallback(
    (data: ResetPasswordFormInput) => {
      resetPassword.mutate(data);
    },
    [resetPassword]
  );

  if (resetPassword.isSuccess) {
    return (
      <div className={styles["reset-password-page"]}>
        <div className={styles["reset-password-container"]}>
          <Title variant="h1" className={styles["reset-password-title"]}>
            {t("title")}
          </Title>
          <div className={styles["reset-password-success"]}>
            <Text variant="body">{t("success.message")}</Text>
            <Text variant="body">{t("success.instructions")}</Text>
          </div>
          <div className={styles["reset-password-footer"]}>
            <NextLink href={authRoutes.signin}>{t("backToSignin")}</NextLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["reset-password-page"]}>
      <div className={styles["reset-password-container"]}>
        <Title variant="h1" className={styles["reset-password-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["reset-password-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["reset-password-form"]}
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

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={resetPassword.isPending}
            aria-label={t("buttonAriaLabel")}
          />
        </Form>

        <div className={styles["reset-password-footer"]}>
          <NextLink
            href={authRoutes.signin}
            className={styles["reset-password-link"]}
          >
            {t("backToSignin")}
          </NextLink>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
