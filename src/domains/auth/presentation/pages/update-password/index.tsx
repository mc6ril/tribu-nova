"use client";

import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/shared/design-system/button";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";

import styles from "./styles.module.scss";

import PasswordStrengthIndicator from "@/domains/auth/presentation/components/PasswordStrengthIndicator";
import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";
import {
  type UpdatePasswordFormInput,
  UpdatePasswordFormSchema,
} from "@/domains/auth/presentation/forms/authForms.schema";
import { useUpdatePassword } from "@/domains/auth/presentation/hooks/password/useUpdatePassword";
import { useAuthRoutes } from "@/domains/auth/presentation/hooks/useAuthRoutes";

const UpdatePasswordPage = () => {
  const t = useTranslations("pages.updatePassword");
  const tFields = useTranslations("pages.updatePassword.fields");

  const updatePassword = useUpdatePassword();
  const authRoutes = useAuthRoutes();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormInput>({
    resolver: zodResolver(UpdatePasswordFormSchema),
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = useCallback(
    (data: UpdatePasswordFormInput) => {
      updatePassword.mutate({ password: data.password });
    },
    [updatePassword]
  );

  if (updatePassword.isSuccess) {
    return (
      <div className={styles["update-password-page"]}>
        <div className={styles["update-password-container"]}>
          <Title variant="h1" className={styles["update-password-title"]}>
            {t("title")}
          </Title>
          <div className={styles["update-password-success"]}>
            <Text variant="body">{t("success")}</Text>
            <Text variant="small">{t("redirecting")}</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["update-password-page"]}>
      <div className={styles["update-password-container"]}>
        <Title variant="h1" className={styles["update-password-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["update-password-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["update-password-form"]}
          aria-label={t("buttonAriaLabel")}
        >
          <div className={styles["update-password-password-group"]}>
            <Input
              {...register("password")}
              type="password"
              label={tFields("password.label")}
              error={translateAuthFieldError(errors.password, (k) =>
                tFields(k)
              )}
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

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={updatePassword.isPending}
            aria-label={t("buttonAriaLabel")}
          />
        </Form>

        <div className={styles["update-password-footer"]}>
          <NextLink
            href={authRoutes.signin}
            className={styles["update-password-link"]}
          >
            {t("backToSignin")}
          </NextLink>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
