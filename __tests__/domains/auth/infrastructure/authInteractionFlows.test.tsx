/**
 * @jest-environment jsdom
 */

import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ResetPasswordPage from "@/domains/auth/presentation/pages/reset-password";
import SignInPage from "@/domains/auth/presentation/pages/signin";
import SignUpPage from "@/domains/auth/presentation/pages/signup";

type MockSupabaseAuth = {
  signInWithPassword: jest.Mock;
  signUp: jest.Mock;
  resetPasswordForEmail: jest.Mock;
};

let mockRouterPush: jest.Mock;
let mockWriteSessionCookieAction: jest.Mock;
let mockSupabaseAuth: MockSupabaseAuth;

jest.mock("next/link", () => {
  const React = jest.requireActual<typeof import("react")>("react");

  return {
    __esModule: true,
    default: ({
      href,
      children,
      ...props
    }: {
      href: string;
      children: ReactNode;
    }) => React.createElement("a", { href, ...props }, children),
  };
});

jest.mock("next-intl", () => ({
  useLocale: () => "fr",
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

jest.mock("@/shared/i18n/routing", () => ({
  buildPathForLocale: (href: string, locale: string) =>
    `/${locale}${href === "/" ? "" : href}`,
}));

jest.mock("@/domains/auth/presentation/hooks/useAuthRoutes", () => ({
  useAuthRoutes: () => ({
    signin: "/fr/auth/signin",
    signup: "/fr/auth/signup",
    resetPassword: "/fr/auth/reset-password",
    updatePassword: "/fr/auth/update-password",
    verifyEmail: "/fr/auth/verify-email",
    legal: "/fr/legal",
  }),
}));

jest.mock("@/shared/navigation/useAppRouter", () => ({
  useAppRouter: () => ({
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("@/shared/infrastructure/supabase/client-browser", () => ({
  createSupabaseBrowserClient: () => ({ auth: mockSupabaseAuth }),
}));

jest.mock(
  "@/domains/auth/infrastructure/actions/writeSessionCookieAction",
  () => ({
    writeSessionCookieAction: (...args: unknown[]) =>
      mockWriteSessionCookieAction(...args),
  })
);

const renderWithQueryClient = (ui: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

const buildSupabaseSession = (email: string) => ({
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: "user-123",
    email,
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {
      display_name: "Test User",
      locale: "fr",
      terms_accepted_at: "2026-01-01T00:00:00.000Z",
    },
    created_at: "2026-01-01T00:00:00.000Z",
  },
});

beforeEach(() => {
  window.history.pushState({}, "", "/auth/signin");

  mockRouterPush = jest.fn();
  mockWriteSessionCookieAction = jest.fn().mockResolvedValue(undefined);
  mockSupabaseAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  };
});

describe("auth interaction flows", () => {
  it("signs in, writes the user cookie, then sends the user to workspace", async () => {
    const email = "user@example.com";
    const password = "correct-password";
    const session = buildSupabaseSession(email);
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { session, user: session.user },
      error: null,
    });

    renderWithQueryClient(
      <SignInPage redirectPath="/workspace" isUnverifiedRedirect={false} />
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: password },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "pages.signin.buttonAriaLabel",
      })
    );

    await waitFor(() => {
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
    });
    await waitFor(() => {
      expect(mockWriteSessionCookieAction).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith("/workspace");
    });
  });

  it("creates an account with a returned session, writes the user cookie, then sends the user to workspace", async () => {
    const email = "new-user@example.com";
    const password = "valid-password";
    const session = buildSupabaseSession(email);
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: { session, user: session.user },
      error: null,
    });

    renderWithQueryClient(<SignUpPage redirectPath="/workspace" />);

    fireEvent.change(
      screen.getByLabelText("pages.signup.fields.displayName.label"),
      { target: { value: "New User" } }
    );
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: password },
    });
    fireEvent.change(
      screen.getByLabelText("pages.signup.fields.confirmPassword.label"),
      { target: { value: password } }
    );
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "pages.signup.fields.acceptedTerms.ariaLabel",
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "pages.signup.buttonAriaLabel",
      })
    );

    await waitFor(() => {
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          password,
          options: expect.objectContaining({
            data: expect.objectContaining({
              display_name: "New User",
              locale: "fr",
              terms_accepted_at: expect.any(String),
            }),
            emailRedirectTo: expect.stringContaining("/auth/callback?next="),
          }),
        })
      );
    });
    await waitFor(() => {
      expect(mockWriteSessionCookieAction).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith("/workspace");
    });
  });

  it("requests a password recovery email when the reset password form is submitted", async () => {
    const email = "user@example.com";
    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

    renderWithQueryClient(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "pages.resetPassword.buttonAriaLabel",
      })
    );

    await waitFor(() => {
      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        expect.objectContaining({
          redirectTo: expect.stringContaining(
            "/auth/callback?next=%2Fauth%2Fupdate-password"
          ),
        })
      );
    });
    expect(
      await screen.findByText("pages.resetPassword.success.message")
    ).toBeInTheDocument();
  });
});
