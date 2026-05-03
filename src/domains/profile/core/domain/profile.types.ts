import type { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/core/i18n";

export type GettingStartedStatus = "pending" | "skipped" | "completed";

export type ProfilePreferences = {
  theme: Theme;
  emailNotifications: boolean;
  language: Locale;
  gettingStartedStatus: GettingStartedStatus;
};

export type Profile = {
  id: string;
  email: string;
  displayName: string | undefined;
  avatarUrl: string | undefined;
  preferences: ProfilePreferences;
  termsAcceptedAt: string;
};
