import { createHmac, timingSafeEqual } from "node:crypto";

import type { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";

import type {
  GettingStartedStatus,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";

export type AppSessionPayload = {
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

const sign = (payload: string, secret: string): string => {
  return createHmac("sha256", secret).update(payload).digest("base64url");
};

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

export const buildDefaultAppSessionPreferences = (): ProfilePreferences => {
  return {
    theme: "system" as Theme,
    emailNotifications: false,
    language: "en" as Locale,
    gettingStartedStatus: "pending" as GettingStartedStatus,
  };
};

export const decodeAppSessionCookieValue = (
  raw: string,
  secret: string | undefined = process.env.APP_SESSION_COOKIE_SECRET
): AppSessionPayload | null => {
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

export const encodeAppSessionCookiePayload = (
  payload: AppSessionPayload,
  secret: string
): string => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(encoded, secret);
  return `${encoded}.${sig}`;
};
