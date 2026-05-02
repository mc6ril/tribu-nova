import { cache } from "react";

import { getAppSessionFromCookie } from "@/shared/infrastructure/auth/appSessionCookie.server";
import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import "server-only";
import type { AuthSession } from "@/domains/auth/core/domain/session.types";
import { mapSupabaseUserToAuthSession } from "@/domains/auth/infrastructure/supabase/SessionMapper.supabase";

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
