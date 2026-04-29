import type { AppError } from "@/shared/errors/appError";
import type { AuthErrorCode } from "@/shared/errors/appErrorCodes";

/**
 * Authentication-related failures use {@link AppError} with an auth {@link AppError.code}.
 */
export type AuthError = AppError & { code: AuthErrorCode };

export type InvalidCredentialsError = AuthError & {
  code: "INVALID_CREDENTIALS";
};

export type EmailAlreadyExistsError = AuthError & {
  code: "EMAIL_ALREADY_EXISTS";
};

export type WeakPasswordError = AuthError & {
  code: "WEAK_PASSWORD";
};

export type InvalidEmailError = AuthError & {
  code: "INVALID_EMAIL";
};

export type AuthenticationError = AuthError & {
  code: "AUTHENTICATION_ERROR";
};

export type AuthProviderServerError = AuthError & {
  code: "AUTH_PROVIDER_SERVER_ERROR";
};

export type EmailVerificationError = AuthError & {
  code: "EMAIL_VERIFICATION_ERROR";
};

export type PasswordResetError = AuthError & {
  code: "PASSWORD_RESET_ERROR";
};

export type InvalidTokenError = AuthError & {
  code: "INVALID_TOKEN";
};

export type SamePasswordError = AuthError & {
  code: "SAME_PASSWORD";
};

export type PasswordUpdateNotAllowedError = AuthError & {
  code: "PASSWORD_UPDATE_NOT_ALLOWED";
};

export type AuthenticationFailure =
  | InvalidCredentialsError
  | EmailAlreadyExistsError
  | WeakPasswordError
  | InvalidEmailError
  | AuthenticationError
  | AuthProviderServerError
  | EmailVerificationError
  | PasswordResetError
  | InvalidTokenError
  | SamePasswordError
  | PasswordUpdateNotAllowedError;
