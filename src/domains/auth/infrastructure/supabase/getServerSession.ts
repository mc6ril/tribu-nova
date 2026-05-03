import { cache } from "react";
import { cookies } from "next/headers";

import { getAppSessionFromCookie } from "@/shared/infrastructure/auth/appSessionCookie.server";
import { getServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";

import "server-only";
import type { AuthSession } from "@/domains/auth/core/domain/session.types";
import { mapSupabaseUserToAuthSession } from "@/domains/auth/infrastructure/supabase/SessionMapper.supabase";

const logger = createLoggerFactory().forScope("auth.server-session");

export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  const cookieSession = await getAppSessionFromCookie();
  if (cookieSession) {
    return cookieSession;
  }

  const cookieStore = await cookies();
  const hasSupabaseAuthCookie = cookieStore
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));

  if (!hasSupabaseAuthCookie) {
    return null;
  }

  const supabase = await getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (error) {
      logger.warn("Supabase session fallback failed", {
        function: "getServerSession",
        errorMessage: error.message,
      });
    }
    return null;
  }

  return mapSupabaseUserToAuthSession(user);
});
