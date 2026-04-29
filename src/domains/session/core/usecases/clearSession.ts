import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Clear the current authentication session.
 */
export const clearSession = async (gateway: SessionGateway): Promise<void> => {
  await gateway.clearSession();
};

