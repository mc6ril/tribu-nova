import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Database,
  Json,
} from "@/shared/infrastructure/supabase/database.types";

import type {
  Profile,
  ProfilePreferences,
} from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";
import { mapUserProfileRowToProfile } from "@/domains/profile/infrastructure/supabase/ProfileMapper.supabase";

export const createSupabaseProfileGateway = (
  supabase: SupabaseClient<Database>
): ProfileGateway => ({
  async getProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .single();

    if (error || !data) return null;

    return mapUserProfileRowToProfile(data);
  },

  async saveProfile(profile: Profile): Promise<void> {
    await supabase.rpc("update_user_profile", {
      new_display_name: profile.displayName,
      new_preferences: profile.preferences as unknown as Json,
      new_terms_accepted_at: profile.termsAcceptedAt || undefined,
    });
  },

  async updatePreferences(preferences: ProfilePreferences): Promise<void> {
    await supabase.rpc("update_user_profile", {
      new_preferences: preferences as unknown as Json,
    });
  },

  async updateDisplayName(displayName: string): Promise<void> {
    await supabase.rpc("update_user_profile", {
      new_display_name: displayName,
    });
  },

  async updateAvatar(avatarUrl: string): Promise<void> {
    await supabase.rpc("update_avatar_url", { new_avatar_url: avatarUrl });
  },
});
