import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";

import type { AuthSession } from "@/domains/session/core/domain/session.types";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Ensure there is an authenticated session.
 * Throws a domain rule error if the user is not authenticated.
 */
export const requireAuthenticatedSession = async (
  gateway: SessionGateway
): Promise<AuthSession> => {
  const session = await gateway.getSession();

  if (!session || !session.user) {
    throw createAppError(AUTH_ERROR_CODES.AUTHENTICATION_ERROR, {
      debugMessage:
        "Authenticated session is required to access this resource.",
    });
  }

  return session;
};
