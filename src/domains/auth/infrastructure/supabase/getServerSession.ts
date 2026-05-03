import { cache } from "react";

import { getAppSessionFromCookie } from "@/shared/infrastructure/auth/appSessionCookie.server";
import { getServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";

import "server-only";
import type { AuthSession } from "@/domains/auth/core/domain/session.types";
import { mapSupabaseUserToAuthSession } from "@/domains/auth/infrastructure/supabase/SessionMapper.supabase";

const logger = createLoggerFactory().forScope("auth.server-session");

export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  logger.info("getServerSession entry", {
    function: "getServerSession",
  });

  const cookieSession = await getAppSessionFromCookie();
  if (cookieSession) {
    logger.info("getServerSession resolved from app cookie", {
      function: "getServerSession",
      userId: cookieSession.user.id,
      email: cookieSession.user.email,
    });
    return cookieSession;
  }

  logger.info("getServerSession app cookie missing; falling back to Supabase", {
    function: "getServerSession",
  });

  const supabase = await getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    logger.info("getServerSession Supabase fallback empty", {
      function: "getServerSession",
      hasError: Boolean(error),
      errorMessage: error?.message,
      hasUser: Boolean(user),
    });
    return null;
  }

  logger.info("getServerSession resolved from Supabase user", {
    function: "getServerSession",
    userId: user.id,
    email: user.email,
  });

  const session = mapSupabaseUserToAuthSession(user);
  logger.info("getServerSession complete", {
    function: "getServerSession",
    userId: session.user.id,
    email: session.user.email,
  });

  return session;
});
