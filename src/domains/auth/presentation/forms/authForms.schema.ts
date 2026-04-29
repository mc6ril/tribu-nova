import { z } from "zod";

import { PASSWORD_LIMITS } from "@/domains/auth/core/domain/password.policy";

const PasswordSchema = z
  .string()
  .min(
    PASSWORD_LIMITS.MIN_LENGTH,
    `Password must be at least ${PASSWORD_LIMITS.MIN_LENGTH} characters`
  )
  .max(
    PASSWORD_LIMITS.MAX_LENGTH,
    `Password must be less than ${PASSWORD_LIMITS.MAX_LENGTH} characters`
  );

export const SignUpFormSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email({ message: "Invalid email format" }),
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
    displayName: z
      .string()
      .trim()
      .max(100, "Display name must be less than 100 characters")
      .optional(),
    acceptedTerms: z.literal(true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormInput = z.infer<typeof SignUpFormSchema>;

export const UpdatePasswordFormSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormInput = z.infer<typeof UpdatePasswordFormSchema>;

export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormInput = z.infer<typeof ChangePasswordFormSchema>;
