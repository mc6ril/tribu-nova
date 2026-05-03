import type {
  AuthResult,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdateCredentialsInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/domains/auth/core/domain/auth.types";

/**
 * Gateway contract for auth-provider operations.
 * Hides infrastructure details (Supabase) behind an application-facing boundary.
 */
export type AuthGateway = {
  /**
   * Sign up a new user.
   * @param input - Signup credentials (email, password)
   * @returns Authentication result with session (or null session with requiresEmailVerification flag if email verification is required)
   * @throws AuthenticationFailure if signup fails (email already exists, weak password, etc.)
   */
  signUp(input: SignUpInput): Promise<AuthResult>;

  /**
   * Sign in an existing user.
   * @param input - Signin credentials (email, password)
   * @returns Authentication result with session (always returns a session for successful signin)
   * @throws InvalidCredentialsError if credentials are invalid
   * @throws AuthenticationFailure for other authentication errors
   */
  signIn(input: SignInInput): Promise<AuthResult>;

  /**
   * Start Google OAuth sign-in flow.
   * Redirects the browser to the OAuth provider and returns once navigation starts.
   * @param redirectPath - Internal path to redirect to after callback
   * @throws AuthenticationFailure if provider redirect cannot be initialized
   */
  signInWithGoogle?(redirectPath?: string): Promise<void>;

  /**
   * Request a password reset email.
   * @param input - Password reset request (email)
   * @throws PasswordResetError if email not found or reset fails
   * @throws AuthenticationFailure for other authentication errors
   */
  resetPasswordForEmail(input: ResetPasswordInput): Promise<void>;

  /**
   * Update password after a password reset (PKCE flow — session established by auth callback).
   * @param input - Password update input
   * @returns Authentication result with session (user is auto-logged in after password update)
   * @throws InvalidTokenError if token/session is invalid or expired
   * @throws PasswordResetError for other password reset errors
   * @throws AuthenticationFailure for other authentication errors
   */
  updatePassword(input: UpdatePasswordInput): Promise<AuthResult>;

  /**
   * Verify email address using a legacy token, token hash, or PKCE code.
   * @param input - Email verification input
   * @returns Authentication result with session (user is auto-logged in after verification)
   * @throws InvalidTokenError if token is invalid or expired
   * @throws EmailVerificationError for other verification errors
   * @throws AuthenticationFailure for other authentication errors
   */
  verifyEmail(input: VerifyEmailInput): Promise<AuthResult>;

  /**
   * Resend verification email.
   * @param email - Email address to resend verification to
   * @throws EmailVerificationError if resend fails
   * @throws AuthenticationFailure for other authentication errors
   */
  resendVerificationEmail(email: string): Promise<void>;

  /**
   * Update auth credentials (email and/or password).
   * Profile data (display name, avatar, preferences) is managed in the profile domain.
   * @param input - Auth credential update (email and/or password)
   * @throws AuthenticationFailure if update fails
   */
  updateCredentials(input: UpdateCredentialsInput): Promise<void>;

  /**
   * Delete the current user account.
   * Permanently deletes the user account and all associated data.
   * @throws AuthenticationFailure if deletion fails
   */
  deleteAccount(): Promise<void>;

  /**
   * Exchange an authorization code for a session (PKCE flow).
   * Used during OAuth/magic-link callback to complete the auth handshake.
   * @param code - Authorization code from the callback URL
   * @throws AuthenticationFailure if code exchange fails
   */
  exchangeCodeForSession(code: string): Promise<void>;
};
