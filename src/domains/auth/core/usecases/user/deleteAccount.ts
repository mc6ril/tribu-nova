import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

/**
 * Delete the current user account.
 * Permanently deletes the user account and all associated data.
 *
 * @param repository - Auth repository
 * @throws AuthenticationFailure if deletion fails
 */
export const deleteAccount = async (gateway: AuthGateway): Promise<void> => {
  return gateway.deleteAccount();
};
