import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

import type { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";
import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";

import "server-only";
import type { AuthSession } from "@/domains/auth/core/domain/session.types";
import type {
  GettingStartedStatus,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";

export const APP_SESSION_COOKIE_NAME = APP_COOKIE_KEYS.USER;
export const APP_SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

type AppSessionPayload = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  preferences: ProfilePreferences;
  emailConfirmedAt: string | null;
  termsAcceptedAt: string;
  expiresAt: number;
  iat: number;
};

const getSecret = (): string => {
  const secret = process.env.APP_SESSION_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "Missing required environment variable APP_SESSION_COOKIE_SECRET"
    );
  }
  return secret;
};

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

const verifySignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expected = sign(payload, secret);
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
};

const isValidPayload = (v: unknown): v is AppSessionPayload => {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.email === "string" &&
    typeof p.expiresAt === "number" &&
    typeof p.iat === "number"
  );
};

const mapToAuthSession = (payload: AppSessionPayload): AuthSession => {
  return {
    user: {
      id: payload.id,
      email: payload.email,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl,
      preferences: payload.preferences ?? buildDefaultPreferences(),
      termsAcceptedAt: payload.termsAcceptedAt ?? "",
    },
    expiresAt: payload.expiresAt,
  };
};

const buildDefaultPreferences = (): ProfilePreferences => {
  return {
    theme: "system" as Theme,
    emailNotifications: false,
    language: "en" as Locale,
    gettingStartedStatus: "pending" as GettingStartedStatus,
  };
};

export const decodeAppSessionCookie = (
  raw: string
): AppSessionPayload | null => {
  const secret = process.env.APP_SESSION_COOKIE_SECRET;
  if (!secret) return null;

  const lastDot = raw.lastIndexOf(".");
  if (lastDot === -1) return null;

  const encoded = raw.slice(0, lastDot);
  const sig = raw.slice(lastDot + 1);

  if (!verifySignature(encoded, sig, secret)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  if (!isValidPayload(parsed)) return null;
  if (Date.now() / 1000 > parsed.expiresAt) return null;

  return parsed;
};

export const encodeAppSessionCookieValue = (
  payload: AppSessionPayload
): string => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(encoded, getSecret());
  return `${encoded}.${sig}`;
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
    if (!payload) return null;
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
