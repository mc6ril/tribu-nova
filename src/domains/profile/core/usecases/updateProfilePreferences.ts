import { z } from "zod";

import type {
  Profile,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

export const ProfilePreferencesSchema = z.object({
  theme: z.string(),
  emailNotifications: z.boolean(),
  language: z.string(),
});

/**
 * Update the current user's profile preferences.
 */
export const updateProfilePreferences = async (
  gateway: ProfileGateway,
  preferences: ProfilePreferences
): Promise<Profile | null> => {
  const validated = ProfilePreferencesSchema.parse(
    preferences
  ) as ProfilePreferences;

  await gateway.updatePreferences(validated);

  return gateway.getProfile();
};
