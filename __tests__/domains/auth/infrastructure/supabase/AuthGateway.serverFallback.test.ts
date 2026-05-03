/**
 * @jest-environment node
 */

import type { SupabaseClient } from "@supabase/supabase-js";

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

jest.mock("@/shared/seo/siteUrl", () => ({
  getSiteUrl: () => new URL("https://tribu.test"),
}));

const createGateway = () => {
  const auth = {
    resetPasswordForEmail: jest.fn(),
    signInWithOAuth: jest.fn(),
    resend: jest.fn(),
  };

  return {
    auth,
    gateway: createSupabaseAuthGateway({
      auth,
    } as unknown as SupabaseClient<Database>),
  };
};

describe("createSupabaseAuthGateway server redirect fallback", () => {
  it("builds absolute callback URLs when no browser window is available", async () => {
    const { auth, gateway } = createGateway();
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    auth.signInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.test/oauth" },
      error: null,
    });
    auth.resend.mockResolvedValue({ error: null });

    await gateway.resetPasswordForEmail({ email: "user@example.com" });
    await gateway.signInWithGoogle!("/workspace?tab=activity");
    await gateway.resendVerificationEmail("user@example.com");

    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      {
        redirectTo:
          "https://tribu.test/auth/callback?next=%2Fauth%2Fupdate-password",
      }
    );
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo:
          "https://tribu.test/auth/callback?next=%2Fworkspace%3Ftab%3Dactivity",
        skipBrowserRedirect: true,
      },
    });
    expect(auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "user@example.com",
      options: {
        emailRedirectTo: "https://tribu.test/auth/verify-email",
      },
    });
  });
});
