import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

/**
 * Exchange an authorization code for a session (PKCE flow).
 * Used during OAuth/magic-link callback.
 *
 * @param repository - Auth repository
 * @param code - Authorization code from the callback URL
 * @throws AuthenticationFailure if code exchange fails
 */
export const exchangeCodeForSession = async (
  gateway: AuthGateway,
  code: string
): Promise<void> => {
  await gateway.exchangeCodeForSession(code);
};
