import type { Profile, ProfilePreferences } from "../domain/profile.types";

export type ProfileGateway = {
  /**
   * Load the current user's profile from the backing store.
   */
  getProfile(): Promise<Profile | null>;

  /**
   * Persist a full profile snapshot.
   */
  saveProfile(profile: Profile): Promise<void>;

  /**
   * Update only profile preferences, leaving other fields unchanged.
   */
  updatePreferences(preferences: ProfilePreferences): Promise<void>;

  /**
   * Update display name.
   */
  updateDisplayName(displayName: string): Promise<void>;

  /**
   * Update avatar URL.
   */
  updateAvatar(avatarUrl: string): Promise<void>;
};
