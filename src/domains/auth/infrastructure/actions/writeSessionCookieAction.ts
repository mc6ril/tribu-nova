"use server";

import { getServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";

import { writeAppSessionCookie } from "@/domains/auth/infrastructure/supabase/authCookie";

const logger = createLoggerFactory().forScope("auth.session-cookie-action");

export const writeSessionCookieAction = async (): Promise<void> => {
  logger.info("writeSessionCookieAction entry", {
    function: "writeSessionCookieAction",
  });

  const supabase = await getServerClient();
  logger.info("Supabase server client resolved", {
    function: "writeSessionCookieAction",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.info("Supabase auth user resolved", {
    function: "writeSessionCookieAction",
    hasUser: Boolean(user),
    userId: user?.id,
    email: user?.email,
  });

  if (user) {
    await writeAppSessionCookie(user);
    logger.info("App session cookie written", {
      function: "writeSessionCookieAction",
      userId: user.id,
      email: user.email,
    });
  } else {
    logger.info("No Supabase user found; app session cookie was not written", {
      function: "writeSessionCookieAction",
    });
  }
};
