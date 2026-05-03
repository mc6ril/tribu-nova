import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

import {
  APP_SESSION_COOKIE_MAX_AGE,
  APP_SESSION_COOKIE_NAME,
  buildAppSessionPayload,
  encodeAppSessionCookieValue,
} from "@/shared/infrastructure/auth/appSessionCookie.server";
import { createLoggerFactory } from "@/shared/observability";

import "server-only";
import { mapSupabaseUserToAuthSession } from "@/domains/auth/infrastructure/supabase/SessionMapper.supabase";

export type AppSessionCookieEntry = {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: "lax";
    path: "/";
    maxAge: number;
  };
};

const logger = createLoggerFactory().forScope("auth.session-cookie");

export const buildAppSessionCookieEntry = (
  user: User
): AppSessionCookieEntry => {
  logger.info("buildAppSessionCookieEntry entry", {
    function: "buildAppSessionCookieEntry",
    userId: user.id,
    email: user.email,
    emailConfirmed: Boolean(user.email_confirmed_at),
  });

  const session = mapSupabaseUserToAuthSession(user);
  const payload = buildAppSessionPayload(
    session,
    user.email_confirmed_at ?? null
  );
  const value = encodeAppSessionCookieValue(payload);
  return {
    name: APP_SESSION_COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: APP_SESSION_COOKIE_MAX_AGE,
    },
  };
};

export const writeAppSessionCookie = async (user: User): Promise<void> => {
  logger.info("writeAppSessionCookie entry", {
    function: "writeAppSessionCookie",
    userId: user.id,
    email: user.email,
  });

  const entry = buildAppSessionCookieEntry(user);
  const cookieStore = await cookies();
  cookieStore.set(entry.name, entry.value, entry.options);
  logger.info("writeAppSessionCookie complete", {
    function: "writeAppSessionCookie",
    cookieName: entry.name,
    maxAge: entry.options.maxAge,
  });
};
