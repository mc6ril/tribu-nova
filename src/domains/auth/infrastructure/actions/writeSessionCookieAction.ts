"use server";

import { getServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";

import { writeAppSessionCookie } from "@/domains/auth/infrastructure/supabase/authCookie";

const logger = createLoggerFactory().forScope("auth.session-cookie-action");

export const writeSessionCookieAction = async (): Promise<void> => {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await writeAppSessionCookie(user);
  } else {
    logger.warn("App session cookie was not written after signin", {
      function: "writeSessionCookieAction",
    });
  }
};
