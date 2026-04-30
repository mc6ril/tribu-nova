import type { Session } from "@supabase/supabase-js";

import type { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";

import type {
  Profile,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";
import type { AuthSession } from "@/domains/session/core/domain/session.types";

const resolveTheme = (raw: unknown): Theme => {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
};

const resolveLocale = (raw: unknown): Locale => {
  if (raw === "fr" || raw === "en" || raw === "es") return raw;
  return "en";
};

/**
 * Maps a Supabase JWT session to the stable SessionUser shape.
 * Reads only from session.user (JWT claims + user_metadata) — zero DB calls.
 */
export const mapSupabaseSessionToAuthSession = (
  session: Session,
  userEmail: string
): AuthSession => {
  const meta = session.user.user_metadata as
    | Record<string, unknown>
    | undefined;

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

  const user: Profile = {
    id: session.user.id,
    email: userEmail,
    displayName: meta?.display_name as string | undefined,
    avatarUrl: meta?.avatar_url as string | undefined,
    preferences,
    termsAcceptedAt: String(meta?.terms_accepted_at ?? ""),
  };

  return { user, expiresAt: session.expires_at };
};
