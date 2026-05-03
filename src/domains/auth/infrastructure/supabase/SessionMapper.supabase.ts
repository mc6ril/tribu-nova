import type { Session, User } from "@supabase/supabase-js";

import type { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";
import { createLoggerFactory } from "@/shared/observability";

import type { AuthSession } from "@/domains/auth/core/domain/session.types";
import type {
  Profile,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";

const logger = createLoggerFactory().forScope("auth.session-mapper");

const resolveTheme = (raw: unknown): Theme => {
  logger.info("resolveTheme entry", {
    function: "resolveTheme",
    raw,
  });

  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
};

const resolveLocale = (raw: unknown): Locale => {
  logger.info("resolveLocale entry", {
    function: "resolveLocale",
    raw,
  });

  if (raw === "fr" || raw === "en" || raw === "es") return raw;
  return "en";
};

const buildProfileFromMeta = (
  id: string,
  email: string,
  meta: Record<string, unknown> | undefined
): Profile => {
  logger.info("buildProfileFromMeta entry", {
    function: "buildProfileFromMeta",
    userId: id,
    email,
    metaKeys: meta ? Object.keys(meta) : [],
  });

  const preferences: ProfilePreferences = {
    theme: resolveTheme(
      (meta?.preferences as Record<string, unknown>)?.theme ?? meta?.theme
    ),
    emailNotifications: Boolean(
      (meta?.preferences as Record<string, unknown>)?.emailNotifications ??
      false
    ),
    language: resolveLocale(
      (meta?.preferences as Record<string, unknown>)?.language ?? meta?.locale
    ),
    gettingStartedStatus: "pending",
  };

  return {
    id,
    email,
    displayName: meta?.display_name as string | undefined,
    avatarUrl: meta?.avatar_url as string | undefined,
    preferences,
    termsAcceptedAt: String(meta?.terms_accepted_at ?? ""),
  };
};

export const mapSupabaseUserToAuthSession = (user: User): AuthSession => {
  logger.info("mapSupabaseUserToAuthSession entry", {
    function: "mapSupabaseUserToAuthSession",
    userId: user.id,
    email: user.email,
  });

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return {
    user: buildProfileFromMeta(user.id, user.email ?? "", meta),
  };
};

export const mapSupabaseSessionToAuthSession = (
  session: Session,
  userEmail: string
): AuthSession => {
  logger.info("mapSupabaseSessionToAuthSession entry", {
    function: "mapSupabaseSessionToAuthSession",
    userId: session.user.id,
    email: userEmail,
    expiresAt: session.expires_at,
  });

  const meta = session.user.user_metadata as
    | Record<string, unknown>
    | undefined;
  return {
    user: buildProfileFromMeta(session.user.id, userEmail, meta),
    expiresAt: session.expires_at,
  };
};
