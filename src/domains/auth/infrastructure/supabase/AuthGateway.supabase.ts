import type { SupabaseClient } from "@supabase/supabase-js";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { isSupportedLocale, type Locale } from "@/shared/core/i18n";
import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";
import { buildPathForLocale } from "@/shared/i18n/routing";
import type { Database } from "@/shared/infrastructure/supabase/database.types";
import { getSiteUrl } from "@/shared/seo/siteUrl";
import {
  buildAuthCallbackPath,
  sanitizeInternalRedirectPath,
  VERIFIED_EMAIL_REDIRECT_PATH,
} from "@/shared/utils/authRedirect";

import type {
  AuthResult,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdateCredentialsInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/domains/auth/core/domain/auth.types";
import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";
import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import {
  mapSupabaseSessionToAuthSession,
  mapSupabaseUserToAuthSession,
} from "@/domains/session/infrastructure/supabase/SessionMapper.supabase";

const resolveBrowserLocaleSegment = (): Locale | null => {
  if (typeof window === "undefined") return null;
  const firstSegment = window.location.pathname.split("/")[1] ?? "";
  return isSupportedLocale(firstSegment) ? firstSegment : null;
};

const redirectToOAuthUrl = (url: string): void => {
  if (typeof window === "undefined") return;
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.assign(url);
      return;
    }
  } catch {
    // ignore frame access issues
  }
  window.location.assign(url);
};

const buildAbsoluteRedirectUrl = ({
  path,
  query,
}: {
  path: string;
  query?: Record<string, string | undefined>;
}): string => {
  const origin = getSiteUrl().origin;
  const locale = resolveBrowserLocaleSegment();
  const url = new URL(locale ? buildPathForLocale(path, locale) : path, origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

const buildBrowserAuthCallbackUrl = ({
  nextPath,
  fallbackPath,
}: {
  nextPath?: string | null;
  fallbackPath?: string;
}): string | undefined => {
  if (typeof window === "undefined" || !window.location.origin)
    return undefined;
  const relativePath = buildAuthCallbackPath({ nextPath, fallbackPath });
  const locale = resolveBrowserLocaleSegment();
  const localePrefixedPath = locale
    ? buildPathForLocale(relativePath, locale)
    : relativePath;
  return `${window.location.origin}${localePrefixedPath}`;
};

export const createSupabaseAuthGateway = (
  supabase: SupabaseClient<Database>
): AuthGateway => ({
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      const emailRedirectTo =
        buildBrowserAuthCallbackUrl({
          nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
        }) ?? buildAbsoluteRedirectUrl({ path: AUTH_PAGE_ROUTES.VERIFY_EMAIL });

      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo,
          data: {
            display_name: input.displayName,
            terms_accepted_at: input.termsAcceptedAt,
            locale: input.locale,
          },
        },
      });

      if (error) return handleAuthError(error);

      const session = data.session;
      const email = data.user?.email ?? input.email;

      if (!session) return { session: null, requiresEmailVerification: true };
      return { session: mapSupabaseSessionToAuthSession(session, email) };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) return handleAuthError(error);

      const session = data.session;
      const email = data.user?.email ?? input.email;

      return {
        session: session
          ? mapSupabaseSessionToAuthSession(session, email)
          : null,
      };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async signInWithGoogle(redirectPath?: string): Promise<void> {
    try {
      const safeNext = sanitizeInternalRedirectPath(
        redirectPath,
        PAGE_ROUTES.WORKSPACE
      );
      const redirectTo =
        buildBrowserAuthCallbackUrl({
          nextPath: safeNext,
          fallbackPath: PAGE_ROUTES.WORKSPACE,
        }) ??
        buildAbsoluteRedirectUrl({
          path: AUTH_PAGE_ROUTES.CALLBACK,
          query: { next: safeNext },
        });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) return handleAuthError(error);

      const oauthUrl = data?.url ?? "";
      if (!oauthUrl)
        return handleAuthError(
          new Error("No OAuth URL returned from Supabase")
        );

      redirectToOAuthUrl(oauthUrl);
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async resetPasswordForEmail(input: ResetPasswordInput): Promise<void> {
    try {
      const redirectTo =
        buildBrowserAuthCallbackUrl({
          nextPath: AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
          fallbackPath: AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
        }) ??
        buildAbsoluteRedirectUrl({
          path: AUTH_PAGE_ROUTES.CALLBACK,
          query: { next: AUTH_PAGE_ROUTES.UPDATE_PASSWORD },
        });

      const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo,
      });
      if (error) return handleAuthError(error);
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async updatePassword(input: UpdatePasswordInput): Promise<AuthResult> {
    try {
      const hasToken = !!input.token?.trim();
      const hasEmail = !!input.email?.trim();

      // Legacy flow: verify recovery OTP then update.
      if (hasToken && hasEmail) {
        const { data: verifyData, error: verifyError } =
          await supabase.auth.verifyOtp({
            email: input.email!,
            token: input.token!,
            type: "recovery",
          });

        if (verifyError) return handleAuthError(verifyError);
        if (!verifyData.session) {
          return handleAuthError(
            createAppError(AUTH_ERROR_CODES.INVALID_TOKEN, {
              debugMessage:
                "No session returned from password recovery token verification.",
            })
          );
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: input.password,
        });
        if (updateError) return handleAuthError(updateError);

        return {
          session: mapSupabaseSessionToAuthSession(
            verifyData.session,
            verifyData.user?.email ?? input.email!
          ),
        };
      }

      // PKCE flow: session already exists from auth callback exchange.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) return handleAuthError(userError);
      if (!user) {
        return handleAuthError(
          createAppError(AUTH_ERROR_CODES.INVALID_TOKEN, {
            debugMessage:
              "No active session. The reset link may be invalid or expired.",
          })
        );
      }

      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({
          password: input.password,
        });
      if (updateError) return handleAuthError(updateError);

      return {
        session: mapSupabaseUserToAuthSession(updateData.user ?? user),
      };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
    try {
      if (input.code?.trim()) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          input.code
        );
        if (error) return handleAuthError(error);

        const session = data.session;
        return {
          session: session
            ? mapSupabaseSessionToAuthSession(
                session,
                session.user.email ?? input.email ?? ""
              )
            : null,
        };
      }

      if (input.tokenHash?.trim()) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: input.tokenHash,
          type: input.type ?? "email",
        });

        if (error) return handleAuthError(error);
        if (!data.session) {
          return handleAuthError(
            createAppError(AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR, {
              debugMessage: "No session returned from token hash verification.",
            })
          );
        }

        return {
          session: mapSupabaseSessionToAuthSession(
            data.session,
            data.user?.email ?? input.email ?? ""
          ),
        };
      }

      if (input.token?.trim()) {
        if (!input.email?.trim()) {
          return handleAuthError(
            createAppError(AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR, {
              debugMessage: "Email is required for legacy email verification.",
            })
          );
        }

        const { data, error } = await supabase.auth.verifyOtp({
          email: input.email,
          token: input.token,
          type: input.type ?? "email",
        });

        if (error) return handleAuthError(error);
        if (!data.session) {
          return handleAuthError(
            createAppError(AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR, {
              debugMessage:
                "No session returned from legacy token verification.",
            })
          );
        }

        return {
          session: mapSupabaseSessionToAuthSession(
            data.session,
            data.user?.email ?? input.email
          ),
        };
      }

      return handleAuthError(
        createAppError(AUTH_ERROR_CODES.EMAIL_VERIFICATION_ERROR, {
          debugMessage: "Missing verification token, token hash, or code.",
        })
      );
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const emailRedirectTo =
        buildBrowserAuthCallbackUrl({
          nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
        }) ?? buildAbsoluteRedirectUrl({ path: AUTH_PAGE_ROUTES.VERIFY_EMAIL });

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo },
      });

      if (error) return handleAuthError(error);
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async updateCredentials(input: UpdateCredentialsInput): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        ...(input.email ? { email: input.email } : {}),
        ...(input.password ? { password: input.password } : {}),
      });
      if (error) return handleAuthError(error);
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async deleteAccount(): Promise<void> {
    throw new Error(
      "deleteAccount must be implemented through an admin route."
    );
  },

  async exchangeCodeForSession(code: string): Promise<void> {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return handleAuthError(error);
    } catch (error) {
      return handleAuthError(error);
    }
  },
});
