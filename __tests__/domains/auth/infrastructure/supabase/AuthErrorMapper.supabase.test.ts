import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";

import { mapSupabaseAuthError } from "@/domains/auth/infrastructure/supabase/AuthErrorMapper.supabase";

describe("mapSupabaseAuthError", () => {
  it.each([
    [
      "email_not_confirmed code",
      {
        message: "Email not confirmed",
        status: 400,
        code: "email_not_confirmed",
      },
      AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    ],
    [
      "invalid credentials",
      { message: "Invalid login credentials", status: 400 },
      AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    ],
    [
      "already registered",
      { message: "User already registered", status: 400 },
      AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    ],
    [
      "same password",
      { message: "New password should be different", status: 422 },
      AUTH_ERROR_CODES.SAME_PASSWORD,
    ],
    [
      "weak password",
      { message: "Password is too short and weak", status: 422 },
      AUTH_ERROR_CODES.WEAK_PASSWORD,
    ],
    [
      "invalid email",
      { message: "Invalid email format", status: 422 },
      AUTH_ERROR_CODES.INVALID_EMAIL,
    ],
    [
      "expired email verification token",
      { message: "Email verification token expired", status: 400 },
      AUTH_ERROR_CODES.INVALID_TOKEN,
    ],
    [
      "email verification failure",
      { message: "Email verification failed", status: 400 },
      AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    ],
    [
      "expired password reset token",
      { message: "Reset link expired", status: 400, code: "email_not_found" },
      AUTH_ERROR_CODES.INVALID_TOKEN,
    ],
    [
      "password reset failure",
      { message: "Password reset failed", status: 400 },
      AUTH_ERROR_CODES.PASSWORD_RESET_ERROR,
    ],
    [
      "invalid token",
      {
        message: "Provider rejected request",
        status: 401,
        code: "invalid_token",
      },
      AUTH_ERROR_CODES.INVALID_TOKEN,
    ],
    [
      "provider server error",
      { message: "Provider unavailable", status: 503 },
      AUTH_ERROR_CODES.AUTH_PROVIDER_SERVER_ERROR,
    ],
  ])("maps %s", (_label, error, expectedCode) => {
    expect(mapSupabaseAuthError(error)).toMatchObject({
      _tag: "AppError",
      code: expectedCode,
      debugMessage: error.message,
    });
  });

  it.each([
    [new Error("Invalid credentials"), AUTH_ERROR_CODES.INVALID_CREDENTIALS],
    [new Error("Email already exists"), AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS],
    [new Error("Password is weak"), AUTH_ERROR_CODES.WEAK_PASSWORD],
    [new Error("Network failure"), AUTH_ERROR_CODES.AUTHENTICATION_ERROR],
  ])("maps plain Error values", (error, expectedCode) => {
    const mapped = mapSupabaseAuthError(error);

    expect(mapped).toMatchObject({
      code: expectedCode,
      debugMessage: error.message,
    });
    if (expectedCode === AUTH_ERROR_CODES.AUTHENTICATION_ERROR) {
      expect(mapped.context?.originalError).toBe(error);
    }
  });

  it("keeps original provider error context for 5xx errors", () => {
    const error = { message: "Provider failed", status: 500 };

    const mapped = mapSupabaseAuthError(error);

    expect(mapped.code).toBe(AUTH_ERROR_CODES.AUTH_PROVIDER_SERVER_ERROR);
    expect(mapped.context?.originalError).toBe(error);
  });

  it.each([
    ["raw string", "Unexpected auth failure", "Unexpected auth failure"],
    [
      "object message",
      { message: "Unexpected object failure" },
      "Unexpected object failure",
    ],
    ["unknown value", null, "An unknown authentication error occurred"],
  ])("maps %s to a generic authentication error", (_label, error, message) => {
    const mapped = mapSupabaseAuthError(error);

    expect(mapped).toMatchObject({
      code: AUTH_ERROR_CODES.AUTHENTICATION_ERROR,
      debugMessage: message,
    });
  });
});
