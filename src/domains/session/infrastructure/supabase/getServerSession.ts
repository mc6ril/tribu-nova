import { cache } from "react";

import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import "server-only";
import type { AuthSession } from "@/domains/session/core/domain/session.types";
import { mapSupabaseSessionToAuthSession } from "@/domains/session/core/infrastructure/SessionMapper.supabase";

/**
 * Returns the current authenticated session, validated against Supabase Auth.
 *
 * Wrapped with React.cache() so it is called at most once per server request,
 * regardless of how many RSC loaders or server functions need the session.
 * This is the canonical way to read auth state in server components and loaders.
 *
 * Returns null when the user is not authenticated or the token is invalid.
 */
export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  const supabase = await getServerClient();

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
});
