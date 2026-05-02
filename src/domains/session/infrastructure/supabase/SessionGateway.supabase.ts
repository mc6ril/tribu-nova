import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/shared/infrastructure/supabase/database.types";

import type { AuthSession } from "@/domains/session/core/domain/session.types";
import { mapSupabaseUserToAuthSession } from "@/domains/session/core/infrastructure/SessionMapper.supabase";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Client-side SessionGateway backed by Supabase.
 * Use from client components and server actions only.
 * In Server Components use getServerSession() which reads the signed cookie.
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

    return mapSupabaseUserToAuthSession(user);
  },

  async clearSession(): Promise<void> {
    await supabase.auth.signOut();
  },

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return !error && user !== null;
  },
});
