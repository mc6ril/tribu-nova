import type { AuthSession } from "@/domains/session/core/domain/session.types";

/**
 * Gateway contract for session operations.
 * Responsible for managing session state and user identity within the app.
 */
export type SessionGateway = {
  /**
   * Get the current session snapshot.
   */
  getSession(): Promise<AuthSession | null>;

  /**
   * Persist the current session snapshot.
   * Passing null clears any existing session.
   */
  setSession(session: AuthSession | null): Promise<void>;

  /**
   * Clear the current session and user identity during sign-out or when the
   * session becomes invalid.
   */
  clearSession(): Promise<void>;

  /**
   * Check if the user is authenticated according to the current session state.
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Optionally subscribe to session changes.
   * Returns an unsubscribe function when implemented.
   */
  onSessionChange?(listener: (session: AuthSession | null) => void): () => void;
};
