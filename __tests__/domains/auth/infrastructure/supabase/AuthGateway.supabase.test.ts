/**
 * @jest-environment jsdom
 */

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";
import type { Database } from "@/shared/infrastructure/supabase/database.types";

import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

jest.mock("@/shared/observability", () => ({
  createLoggerFactory: () => ({
    forScope: () => ({
      warn: jest.fn(),
    }),
  }),
}));

jest.mock("@/shared/i18n/routing", () => ({
  buildPathForLocale: (href: string, locale: string) =>
    `/${locale}${href === "/" ? "" : href}`,
}));

type SupabaseAuthMock = {
  signUp: jest.Mock;
  signInWithPassword: jest.Mock;
  signInWithOAuth: jest.Mock;
  resetPasswordForEmail: jest.Mock;
  getUser: jest.Mock;
  updateUser: jest.Mock;
  exchangeCodeForSession: jest.Mock;
  verifyOtp: jest.Mock;
  resend: jest.Mock;
};

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "user-123",
    email: "user@example.com",
    email_confirmed_at: "2026-01-01T00:00:00.000Z",
    app_metadata: {},
    user_metadata: {
      display_name: "Test User",
      preferences: {
        theme: "dark",
        emailNotifications: true,
        language: "fr",
      },
      terms_accepted_at: "2026-01-01T00:00:00.000Z",
    },
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }) as User;

const buildSession = (overrides: Partial<Session> = {}): Session =>
  ({
    access_token: "access-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    expires_at: 1_777_777_777,
    token_type: "bearer",
    user: buildUser(),
    ...overrides,
  }) as Session;

const createGateway = () => {
  const auth: SupabaseAuthMock = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    exchangeCodeForSession: jest.fn(),
    verifyOtp: jest.fn(),
    resend: jest.fn(),
  };
  const supabase = { auth } as unknown as SupabaseClient<Database>;

  return {
    auth,
    gateway: createSupabaseAuthGateway(supabase),
  };
};

beforeEach(() => {
  window.history.pushState({}, "", "/fr/auth/signin");
});

describe("createSupabaseAuthGateway", () => {
  it("signs up with metadata and returns verification-required when Supabase returns no session", async () => {
    const { auth, gateway } = createGateway();
    auth.signUp.mockResolvedValue({
      data: { session: null, user: { email: "new@example.com" } },
      error: null,
    });

    const result = await gateway.signUp({
      email: "new@example.com",
      password: "valid-password",
      displayName: "New User",
      termsAcceptedAt: "2026-01-01T00:00:00.000Z",
      locale: "fr",
    });

    expect(auth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "valid-password",
      options: {
        emailRedirectTo: expect.stringContaining(
          "/fr/auth/callback?next=%2Fauth%2Fverify-email%3Fverified%3D1"
        ),
        data: {
          display_name: "New User",
          terms_accepted_at: "2026-01-01T00:00:00.000Z",
          locale: "fr",
        },
      },
    });
    expect(result).toEqual({
      session: null,
      requiresEmailVerification: true,
    });
  });

  it("maps a sign up session and falls back to the submitted email", async () => {
    const { auth, gateway } = createGateway();
    auth.signUp.mockResolvedValue({
      data: { session: buildSession(), user: null },
      error: null,
    });

    const result = await gateway.signUp({
      email: "submitted@example.com",
      password: "valid-password",
      termsAcceptedAt: "2026-01-01T00:00:00.000Z",
      locale: "en",
    });

    expect(result.session?.user.email).toBe("submitted@example.com");
    expect(result.session?.user.preferences.theme).toBe("dark");
  });

  it("maps rejected sign up calls through auth error handling", async () => {
    const { auth, gateway } = createGateway();
    auth.signUp.mockRejectedValue(new Error("Email already exists"));

    await expect(
      gateway.signUp({
        email: "existing@example.com",
        password: "valid-password",
        termsAcceptedAt: "2026-01-01T00:00:00.000Z",
        locale: "fr",
      })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    });
  });

  it("maps resolved sign up provider errors through auth error handling", async () => {
    const { auth, gateway } = createGateway();
    auth.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Invalid email format", status: 422 },
    });

    await expect(
      gateway.signUp({
        email: "invalid",
        password: "valid-password",
        termsAcceptedAt: "2026-01-01T00:00:00.000Z",
        locale: "fr",
      })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_EMAIL,
    });
  });

  it("maps sign in success, null session, and provider errors", async () => {
    const { auth, gateway } = createGateway();
    auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: buildSession(), user: buildUser() },
      error: null,
    });

    await expect(
      gateway.signIn({
        email: "user@example.com",
        password: "valid-password",
      })
    ).resolves.toMatchObject({
      session: {
        user: { id: "user-123", email: "user@example.com" },
      },
    });

    auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: null,
    });

    await expect(
      gateway.signIn({
        email: "user@example.com",
        password: "valid-password",
      })
    ).resolves.toEqual({ session: null });

    auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: "Invalid login credentials", status: 400 },
    });

    await expect(
      gateway.signIn({
        email: "user@example.com",
        password: "bad-password",
      })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    });
  });

  it("starts Google OAuth with a safe redirect and maps missing provider URLs", async () => {
    const { auth, gateway } = createGateway();
    auth.signInWithOAuth.mockResolvedValue({
      data: { url: "" },
      error: null,
    });

    await expect(
      gateway.signInWithGoogle!("//evil.example")
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.AUTHENTICATION_ERROR,
    });

    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining(
          "/fr/auth/callback?next=%2Fworkspace"
        ),
        skipBrowserRedirect: true,
      },
    });
  });

  it("maps Google OAuth provider errors and null payloads", async () => {
    const { auth, gateway } = createGateway();
    auth.signInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await expect(gateway.signInWithGoogle!("/workspace")).rejects.toMatchObject(
      {
        code: AUTH_ERROR_CODES.AUTHENTICATION_ERROR,
      }
    );

    auth.signInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: { message: "Provider unavailable", status: 503 },
    });

    await expect(gateway.signInWithGoogle!("/workspace")).rejects.toMatchObject(
      {
        code: AUTH_ERROR_CODES.AUTH_PROVIDER_SERVER_ERROR,
      }
    );
  });

  it("requests a password reset email with an update-password callback", async () => {
    const { auth, gateway } = createGateway();
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    await gateway.resetPasswordForEmail({ email: "user@example.com" });

    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      {
        redirectTo: expect.stringContaining(
          "/fr/auth/callback?next=%2Fauth%2Fupdate-password"
        ),
      }
    );
  });

  it("maps rejected password reset calls through auth error handling", async () => {
    const { auth, gateway } = createGateway();
    auth.resetPasswordForEmail.mockRejectedValue(
      new Error("Password reset failed")
    );

    await expect(
      gateway.resetPasswordForEmail({ email: "user@example.com" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.AUTHENTICATION_ERROR,
    });
  });

  it("maps resolved password reset provider errors through auth error handling", async () => {
    const { auth, gateway } = createGateway();
    auth.resetPasswordForEmail.mockResolvedValue({
      error: { message: "Password reset failed", status: 400 },
    });

    await expect(
      gateway.resetPasswordForEmail({ email: "user@example.com" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.PASSWORD_RESET_ERROR,
    });
  });

  it("updates the password only for an authenticated user", async () => {
    const { auth, gateway } = createGateway();
    const currentUser = buildUser();
    auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(
      gateway.updatePassword({ password: "new-password" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
    });

    auth.getUser.mockResolvedValueOnce({
      data: { user: currentUser },
      error: null,
    });
    auth.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const result = await gateway.updatePassword({ password: "new-password" });

    expect(auth.updateUser).toHaveBeenCalledWith({
      password: "new-password",
    });
    expect(result.session).not.toBeNull();
    expect(result.session!.user.id).toBe(currentUser.id);
  });

  it("verifies emails through code, token hash, and legacy token paths", async () => {
    const { auth, gateway } = createGateway();
    auth.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: buildSession() },
      error: null,
    });

    await expect(
      gateway.verifyEmail({ code: "code-123" })
    ).resolves.toMatchObject({
      session: { user: { id: "user-123" } },
    });

    auth.verifyOtp.mockResolvedValueOnce({
      data: { session: buildSession(), user: buildUser() },
      error: null,
    });

    await expect(
      gateway.verifyEmail({ tokenHash: "hash-123", type: "signup" })
    ).resolves.toMatchObject({
      session: { user: { email: "user@example.com" } },
    });

    auth.verifyOtp.mockResolvedValueOnce({
      data: { session: buildSession(), user: buildUser({ email: undefined }) },
      error: null,
    });

    await expect(
      gateway.verifyEmail({
        email: "legacy@example.com",
        token: "token-123",
      })
    ).resolves.toMatchObject({
      session: { user: { email: "legacy@example.com" } },
    });
  });

  it("rejects invalid email verification inputs", async () => {
    const { auth, gateway } = createGateway();
    auth.verifyOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: null,
    });

    await expect(
      gateway.verifyEmail({ tokenHash: "hash-without-session" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    });

    await expect(
      gateway.verifyEmail({ token: "legacy-token-without-email" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    });

    auth.verifyOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: null,
    });

    await expect(
      gateway.verifyEmail({
        email: "legacy@example.com",
        token: "legacy-token-without-session",
      })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    });

    await expect(gateway.verifyEmail({})).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    });
  });

  it("maps provider errors and empty code sessions during email verification", async () => {
    const { auth, gateway } = createGateway();
    auth.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    await expect(
      gateway.verifyEmail({ code: "empty-session" })
    ).resolves.toEqual({
      session: null,
    });

    auth.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: "Token expired", status: 400 },
    });

    await expect(
      gateway.verifyEmail({ code: "expired" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
    });

    auth.verifyOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: "Email verification failed", status: 400 },
    });

    await expect(
      gateway.verifyEmail({ email: "user@example.com", token: "bad-token" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    });
  });

  it("resends verification emails, updates credentials, and exchanges auth codes", async () => {
    const { auth, gateway } = createGateway();
    auth.resend.mockResolvedValue({ error: null });
    auth.updateUser.mockResolvedValue({ error: null });
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });

    await gateway.resendVerificationEmail("user@example.com");
    await gateway.updateCredentials({
      email: "next@example.com",
      password: "next-password",
    });
    await gateway.exchangeCodeForSession("code-123");

    expect(auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "user@example.com",
      options: {
        emailRedirectTo: expect.stringContaining(
          "/fr/auth/callback?next=%2Fauth%2Fverify-email%3Fverified%3D1"
        ),
      },
    });
    expect(auth.updateUser).toHaveBeenCalledWith({
      email: "next@example.com",
      password: "next-password",
    });
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("code-123");
  });

  it("maps rejected resend verification calls through auth error handling", async () => {
    const { auth, gateway } = createGateway();
    auth.resend.mockRejectedValue({
      message: "Invalid email format",
      status: 422,
    });

    await expect(
      gateway.resendVerificationEmail("invalid")
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_EMAIL,
    });
  });

  it("maps resolved resend verification provider errors through auth error handling", async () => {
    const { auth, gateway } = createGateway();
    auth.resend.mockResolvedValue({
      error: { message: "Email verification failed", status: 400 },
    });

    await expect(
      gateway.resendVerificationEmail("user@example.com")
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR,
    });
  });

  it("updates only the provided credential fields", async () => {
    const { auth, gateway } = createGateway();
    auth.updateUser.mockResolvedValue({ error: null });

    await gateway.updateCredentials({ email: "next@example.com" });

    expect(auth.updateUser).toHaveBeenCalledWith({
      email: "next@example.com",
    });
  });

  it("maps provider errors from update and exchange methods", async () => {
    const { auth, gateway } = createGateway();
    auth.getUser.mockResolvedValue({
      data: { user: buildUser() },
      error: { message: "Invalid token", status: 401 },
    });
    await expect(
      gateway.updatePassword({ password: "new-password" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
    });

    auth.updateUser.mockResolvedValue({
      error: { message: "Same password", status: 422 },
    });
    await expect(
      gateway.updateCredentials({ password: "same-password" })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.SAME_PASSWORD,
    });

    auth.exchangeCodeForSession.mockResolvedValue({
      error: { message: "Token expired", status: 400 },
    });
    await expect(
      gateway.exchangeCodeForSession("expired")
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
    });
  });

  it("keeps deleteAccount behind an admin route", async () => {
    const { gateway } = createGateway();

    await expect(gateway.deleteAccount()).rejects.toThrow(
      "deleteAccount must be implemented through an admin route."
    );
  });
});
