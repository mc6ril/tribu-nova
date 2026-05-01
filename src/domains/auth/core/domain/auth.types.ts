import type { Locale } from "@/shared/core/i18n";

import type { AuthSession } from "@/domains/session/core/domain/session.types";

export type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
  termsAcceptedAt: string;
  /** Used in Supabase email templates (`user_metadata.locale`). */
  locale: Locale;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type ResetPasswordInput = {
  email: string;
};

export type UpdatePasswordInput = {
  password: string;
  token?: string;
  email?: string;
};

export type VerifyEmailLinkType = "email" | "signup";

export type VerifyEmailInput = {
  email?: string;
  token?: string;
  tokenHash?: string;
  code?: string;
  type?: VerifyEmailLinkType;
};

export type UpdateCredentialsInput = {
  email?: string;
  password?: string;
};

export type AuthResult = {
  session: AuthSession | null;
  requiresEmailVerification?: boolean;
};
