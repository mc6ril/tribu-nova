import { Session } from "@supabase/supabase-js";

import { AuthSession } from "@/domains/session/core/domain/session.types";

/**
 * Maps Supabase Session to the stable session shape returned by auth flows.
 */
export const mapSupabaseSessionToCurrentSession = (
  session: Session,
  userEmail: string
): AuthSession => {
  return {
    user: {
      id: session.user.id,
      email: userEmail,
      displayName: session.user.user_metadata.display_name,
      avatarUrl: session.user.user_metadata.avatar_url,
      preferences: session.user.user_metadata.preferences,
      termsAcceptedAt: session.user.user_metadata.terms_accepted_at,
    },
    expiresAt: session.expires_at,
  };
};
