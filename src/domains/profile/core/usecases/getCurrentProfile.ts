import type { Profile } from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

/**
 * Load the current user's profile from the backing store.
 */
export const getCurrentProfile = async (
  gateway: ProfileGateway
): Promise<Profile | null> => {
  return gateway.getProfile();
};
