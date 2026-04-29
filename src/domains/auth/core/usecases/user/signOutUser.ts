import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

/**
 * Sign out the current user.
 * Clears the current session.
 *
 * @param repository - Auth repository
 * @throws AuthenticationFailure if signout fails
 */
export const signOutUser = async (gateway: AuthGateway): Promise<void> => {
  return gateway.signOut();
};
