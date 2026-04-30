import type { AuthSession } from "@/domains/session/core/domain/session.types";

/**
 * Gateway contract for reading and clearing the current session.
 *
 * Session persistence (cookie write) is handled automatically by @supabase/ssr
 * and does not belong here. This gateway is read-only from the app's perspective.
 */
export type SessionGateway = {
  /**
   * Return the current session snapshot, or null if not authenticated.
   * On the server this calls getUser() (validated against Supabase Auth).
   * On the client this reads from the in-memory Supabase client state.
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
