import type { Session, User } from "@supabase/supabase-js";

import type { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";

import type { AuthSession } from "@/domains/auth/core/domain/session.types";
import type {
  Profile,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";

const resolveTheme = (raw: unknown): Theme => {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
};

const resolveLocale = (raw: unknown): Locale => {
  if (raw === "fr" || raw === "en" || raw === "es") return raw;
  return "en";
};

const buildProfileFromMeta = (
  id: string,
  email: string,
  meta: Record<string, unknown> | undefined
): Profile => {
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
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return {
    user: buildProfileFromMeta(user.id, user.email ?? "", meta),
  };
};

export const mapSupabaseSessionToAuthSession = (
  session: Session,
  userEmail: string
): AuthSession => {
  const meta = session.user.user_metadata as
    | Record<string, unknown>
    | undefined;
  return {
    user: buildProfileFromMeta(session.user.id, userEmail, meta),
    expiresAt: session.expires_at,
  };
};
