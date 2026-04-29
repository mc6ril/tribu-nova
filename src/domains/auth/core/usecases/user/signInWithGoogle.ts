import { createAppError } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";

import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

/**
 * Start Google OAuth sign-in flow.
 * Delegates provider-specific details to the authentication repository.
 *
 * @param repository - Auth repository
 * @param redirectPath - Internal path to redirect after auth callback
 */
export const signInWithGoogle = async (
  gateway: AuthGateway,
  redirectPath?: string
): Promise<void> => {
  if (!gateway.signInWithGoogle) {
    throw createAppError(INFRA_ERROR_CODE.GOOGLE_OAUTH_NOT_AVAILABLE, {
      debugMessage: "Google OAuth is not available in this auth gateway.",
    });
  }

  await gateway.signInWithGoogle(redirectPath);
};
