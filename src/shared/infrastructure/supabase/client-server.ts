import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { requireNonEmptyEnv } from "@/shared/errors/programmingError";
import type { Database } from "@/shared/infrastructure/supabase/database.types";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireNonEmptyEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL"
    ),
    requireNonEmptyEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    ),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies; middleware handles token refresh.
          }
        },
      },
    }
  );
};

/**
 * Request-scoped Supabase server client via React.cache().
 * Use this in RSC and server functions instead of createSupabaseServerClient().
 */
export const getServerClient = cache(createSupabaseServerClient);
