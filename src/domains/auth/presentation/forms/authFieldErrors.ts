import { PASSWORD_LIMITS } from "@/domains/auth/core/domain/password.policy";

type AuthFieldError = { type?: string; message?: string } | undefined;
type AuthFieldTranslator = (key: string) => string;

const AUTH_FIELD_MESSAGE_KEY_BY_MESSAGE: Record<string, string> = Object.freeze(
  {
    "Email is required": "email.required",
    "Invalid email format": "email.invalid",
    "Password is required": "password.required",
    [`Password must be at least ${PASSWORD_LIMITS.MIN_LENGTH} characters`]:
      "password.tooShort",
    [`Password must be less than ${PASSWORD_LIMITS.MAX_LENGTH} characters`]:
      "password.tooLong",
    "Password confirmation is required": "confirmPassword.required",
    "Passwords do not match": "confirmPassword.mismatch",
  }
);

export const translateAuthFieldError = (
  error: AuthFieldError,
  tFields: AuthFieldTranslator
): string | undefined => {
  if (!error?.message) {
    return undefined;
  }

  if (error.type === "server") {
    return error.message;
  }

  const translationKey = AUTH_FIELD_MESSAGE_KEY_BY_MESSAGE[error.message];
  return translationKey ? tFields(translationKey) : error.message;
};
