import type { AuthSession } from "@/domains/session/core/domain/session.types";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Get the current authentication session snapshot.
 */
export const getCurrentSession = async (
  gateway: SessionGateway,
): Promise<AuthSession | null> => {
  return gateway.getSession();
};

