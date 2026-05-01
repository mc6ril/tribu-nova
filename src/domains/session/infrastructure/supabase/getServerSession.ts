import { cache } from "react";

import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import "server-only";
import type { AuthSession } from "@/domains/session/core/domain/session.types";
import { mapSupabaseUserToAuthSession } from "@/domains/session/core/infrastructure/SessionMapper.supabase";

/**
 * Returns the current authenticated session, validated against Supabase Auth.
 *
 * Uses getUser() exclusively — server-validates the JWT on every call.
 * Wrapped with React.cache() so it fires at most once per server request.
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

  return mapSupabaseUserToAuthSession(user);
});
