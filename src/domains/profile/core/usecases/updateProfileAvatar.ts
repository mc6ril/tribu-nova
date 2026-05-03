import { z } from "zod";

import type { Profile } from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

export const ProfileAvatarUrlSchema = z
  .string()
  .url("Avatar URL must be a valid URL");

/**
 * Update the current user's avatar URL.
 */
export const updateProfileAvatar = async (
  gateway: ProfileGateway,
  avatarUrl: string
): Promise<Profile | null> => {
  const validated = ProfileAvatarUrlSchema.parse(avatarUrl);

  await gateway.updateAvatar(validated);

  return gateway.getProfile();
};
