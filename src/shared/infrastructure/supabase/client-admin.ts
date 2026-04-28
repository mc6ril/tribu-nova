import { createClient } from "@supabase/supabase-js";

import { requireNonEmptyEnv } from "@/shared/errors/programmingError";

/**
 * Create Supabase admin client with service_role key.
 * This client bypasses RLS and allows admin operations.
 *
 * ⚠️ SECURITY WARNING: This should ONLY be used server-side.
 * Never expose the service_role key to the client.
 *
 * @returns Supabase admin client
 * @throws ProgrammingError if service_role key or URL is not configured
 */
export const createSupabaseAdminClient = () => {
  const serviceRoleKey = requireNonEmptyEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY is not configured. " +
      "Please add it to your .env.local file. " +
      "You can find it in your Supabase dashboard: Settings → API → service_role key"
  );
  const supabaseUrl = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL is not configured. This is required for Supabase client."
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
