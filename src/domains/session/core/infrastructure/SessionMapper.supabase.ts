import { Session } from "@supabase/supabase-js";

import { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";

import type { ProfilePreferences } from "@/domains/profile/core/domain/profile.types";
import { AuthSession } from "@/domains/session/core/domain/session.types";

/**
 * Maps Supabase Session to the stable session shape returned by auth flows.
 */
export const mapSupabaseSessionToCurrentSession = (
  session: Session,
  userEmail: string
): AuthSession => {
  const rawPreferences = session.user.user_metadata.preferences as
    | Partial<ProfilePreferences>
    | undefined;

  const languageCandidate = rawPreferences?.language;
  const language: Locale =
    languageCandidate === "fr" ||
    languageCandidate === "en" ||
    languageCandidate === "es"
      ? languageCandidate
      : "en";

  const themeCandidate = rawPreferences?.theme;
  const theme: Theme =
    themeCandidate === "light" ||
    themeCandidate === "dark" ||
    themeCandidate === "system"
      ? themeCandidate
      : "system";

  const preferences: ProfilePreferences = {
    theme,
    emailNotifications: rawPreferences?.emailNotifications ?? false,
    language,
  };

  return {
    user: {
      id: session.user.id,
      email: userEmail,
      displayName: session.user.user_metadata.display_name,
      avatarUrl: session.user.user_metadata.avatar_url,
      preferences,
      termsAcceptedAt: String(
        session.user.user_metadata.terms_accepted_at ?? ""
      ),
    },
    expiresAt: session.expires_at,
  };
};
