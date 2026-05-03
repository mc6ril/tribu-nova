import type { Tables } from "@/shared/infrastructure/supabase/database.types";

import type {
  GettingStartedStatus,
  Profile,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";

const resolveTheme = (raw: unknown) => {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system" as const;
};

const resolveLocale = (raw: unknown) => {
  if (raw === "fr" || raw === "en" || raw === "es") return raw;
  return "en" as const;
};

const resolveGettingStartedStatus = (raw: unknown): GettingStartedStatus => {
  if (raw === "pending" || raw === "skipped" || raw === "completed") return raw;
  return "pending";
};

export const mapUserProfileRowToProfile = (
  row: Tables<"user_profiles">
): Profile => {
  const raw = row.preferences as Record<string, unknown> | null;

  const preferences: ProfilePreferences = {
    theme: resolveTheme(raw?.theme),
    emailNotifications: Boolean(raw?.emailNotifications ?? false),
    language: resolveLocale(raw?.language),
    gettingStartedStatus: resolveGettingStartedStatus(
      raw?.gettingStartedStatus
    ),
  };

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    preferences,
    termsAcceptedAt: row.terms_accepted_at ?? "",
  };
};
