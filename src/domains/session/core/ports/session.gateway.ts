import type { AuthSession } from "@/domains/session/core/domain/session.types";

/**
 * Gateway contract for reading and clearing the current session.
 *
 * For server rendering, prefer `getServerSession()` which reads the signed
 * `workbench-user` cookie (zero network calls on the happy path).
 * This gateway is used by client-side code and server actions.
 */
export type SessionGateway = {
  /**
   * Return the current session snapshot, or null if not authenticated.
   * Implementations must authenticate cookie/storage-backed data before mapping
   * it into the domain session shape.
   */
  getSession(): Promise<AuthSession | null>;

  /**
   * Sign out and clear the session cookie.
   */
  clearSession(): Promise<void>;

  /**
   * Quick authenticated check without loading the full session.
   */
  isAuthenticated(): Promise<boolean>;
};
