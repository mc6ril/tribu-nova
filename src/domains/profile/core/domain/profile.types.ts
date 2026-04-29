import { Theme } from "@/shared/constants/theme";
import type { Locale } from "@/shared/i18n/config";

export type ProfilePreferences = {
  theme: Theme;
  emailNotifications: boolean;
  language: Locale;
};

export type Profile = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  preferences: ProfilePreferences;
  termsAcceptedAt: string;
};
