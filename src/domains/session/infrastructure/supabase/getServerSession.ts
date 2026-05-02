import { cache } from "react";

import { getAppSessionFromCookie } from "@/shared/infrastructure/auth/appSessionCookie.server";
import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import "server-only";
import type { AuthSession } from "@/domains/session/core/domain/session.types";
import { mapSupabaseUserToAuthSession } from "@/domains/session/core/infrastructure/SessionMapper.supabase";

/**
 * Returns the current authenticated session for Server Components.
 *
 * Happy path: reads the signed `workbench-user` cookie — zero network calls.
 *
 * Fallback (cookie absent or expired): authenticates the Supabase cookie with
 * the Auth server, then maps the validated user.
 *
 * Wrapped with React.cache() so it fires at most once per server request.
 */
export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  const cookieSession = await getAppSessionFromCookie();
  if (cookieSession) {
    return cookieSession;
  }

  const supabase = await getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return mapSupabaseUserToAuthSession(user);
});
