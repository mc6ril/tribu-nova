import { z } from "zod";

import type {
  Profile,
} from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

export const ProfileDisplayNameSchema = z
  .string()
  .trim()
  .max(100, "Display name must be less than 100 characters");

/**
 * Update the current user's display name.
 */
export const updateProfileDisplayName = async (
  gateway: ProfileGateway,
  displayName: string,
): Promise<Profile | null> => {
  const validated = ProfileDisplayNameSchema.parse(displayName);

  await gateway.updateDisplayName(validated);

  return gateway.getProfile();
};

