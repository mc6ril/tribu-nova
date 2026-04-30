import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/infrastructure/supabase/database.types";

import type { AuthSession } from "@/domains/session/core/domain/session.types";
import { mapSupabaseSessionToAuthSession } from "@/domains/session/core/infrastructure/SessionMapper.supabase";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Server-side SessionGateway backed by Supabase.
 * Uses getUser() to validate the JWT against Supabase Auth on every call —
 * wrap with React.cache() at the call site to deduplicate within a request.
 */
export const createSupabaseSessionGateway = (
  supabase: SupabaseClient<Database>
): SessionGateway => ({
  async getSession(): Promise<AuthSession | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    return mapSupabaseSessionToAuthSession(session, user.email ?? "");
  },

  async clearSession(): Promise<void> {
    await supabase.auth.signOut();
  },

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user !== null;
  },
});
