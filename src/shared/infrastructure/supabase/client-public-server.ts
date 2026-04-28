import { createClient } from "@supabase/supabase-js";

import { requireNonEmptyEnv } from "@/shared/errors/programmingError";

import "server-only";

/**
 * Server-side Supabase client without cookie/session handling.
 * Safe for cacheable public reads such as public runtime config.
 */
export const createSupabasePublicServerClient = () => {
  const supabaseUrl = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL is not configured. This is required for Supabase client."
  );
  const supabasePublishableKey = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not configured."
  );

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
