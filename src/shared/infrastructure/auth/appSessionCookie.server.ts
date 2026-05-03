import { cookies } from "next/headers";

import {
  type AppSessionPayload,
  buildDefaultAppSessionPreferences,
  decodeAppSessionCookieValue,
  encodeAppSessionCookiePayload,
} from "@/shared/infrastructure/auth/appSessionCookieValue";
import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";
import { createLoggerFactory } from "@/shared/observability";

import "server-only";
import type { AuthSession } from "@/domains/auth/core/domain/session.types";

export const APP_SESSION_COOKIE_NAME = APP_COOKIE_KEYS.USER;
export const APP_SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const logger = createLoggerFactory().forScope("auth.app-session-cookie");

const getSecret = (): string => {
  const secret = process.env.APP_SESSION_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "Missing required environment variable APP_SESSION_COOKIE_SECRET"
    );
  }
  return secret;
};

const mapToAuthSession = (payload: AppSessionPayload): AuthSession => {
  return {
    user: {
      id: payload.id,
      email: payload.email,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl,
      preferences: payload.preferences ?? buildDefaultAppSessionPreferences(),
      termsAcceptedAt: payload.termsAcceptedAt ?? "",
    },
    expiresAt: payload.expiresAt,
  };
};

export const decodeAppSessionCookie = (
  raw: string
): AppSessionPayload | null => {
  return decodeAppSessionCookieValue(raw);
};

export const encodeAppSessionCookieValue = (
  payload: AppSessionPayload
): string => {
  return encodeAppSessionCookiePayload(payload, getSecret());
};

export const buildAppSessionPayload = (
  session: AuthSession,
  emailConfirmedAt: string | null
): AppSessionPayload => {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    avatarUrl: session.user.avatarUrl,
    preferences: session.user.preferences,
    emailConfirmedAt,
    termsAcceptedAt: session.user.termsAcceptedAt,
    expiresAt: now + APP_SESSION_COOKIE_MAX_AGE,
    iat: now,
  };
};

export const getAppSessionFromCookie =
  async (): Promise<AuthSession | null> => {
    const cookieStore = await cookies();
    const raw = cookieStore.get(APP_SESSION_COOKIE_NAME)?.value;

    if (!raw) return null;
    const payload = decodeAppSessionCookie(raw);

    if (!payload) {
      logger.warn("Invalid app session cookie ignored", {
        function: "getAppSessionFromCookie",
        cookieName: APP_SESSION_COOKIE_NAME,
      });
      return null;
    }
    return mapToAuthSession(payload);
  };

export const clearAppSessionCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};
