import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { throwProgrammingError } from "@/shared/errors/programmingError";
import type { Database } from "@/shared/infrastructure/supabase/database.types";
import { isDynamicServerUsageError } from "@/shared/infrastructure/supabase/nextErrors";
import { createLoggerFactory } from "@/shared/observability";

const logger = createLoggerFactory().forScope("Supabase.ServerClient");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/** Validate required env vars; throw with helpful message on missing. */
const validateEnvironmentVariables = (): void => {
  const missingVariables: string[] = [];

  if (!SUPABASE_URL) {
    missingVariables.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    missingVariables.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  }

  if (missingVariables.length > 0) {
    const variablesList = missingVariables.join(", ");
    throwProgrammingError(
      `Missing required environment variable(s): ${variablesList}\n` +
        `Please add them to your .env.local file.\n` +
        `See .env.local.example for reference.`
    );
  }
};

/**
 * Create Supabase client for server (Server Components, Server Actions, Middleware).
 * Uses @supabase/ssr to handle sessions via cookies.
 * Creates a new instance on each call (no singleton) to ensure proper cookie handling
 * in server contexts where cookies may change between requests.
 *
 * Prefer getServerClient() in RSC and server functions — it is request-scoped
 * and avoids creating redundant instances within the same request.
 */
export const createSupabaseServerClient = async () => {
  try {
    validateEnvironmentVariables();

    const cookieStore = await cookies();

    return createServerClient<Database>(
      SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This is expected behavior in Next.js App Router - cookies can only be
              // modified in Server Actions or Route Handlers, not in Server Components.
              // This is safe to ignore because:
              // 1. Middleware handles session refresh (can modify cookies)
              // 2. Server Components can still read sessions (getAll works)
              // 3. Session refresh will happen in middleware on subsequent requests
              // Only log in development for debugging, suppress in production
              if (
                process.env.NODE_ENV === "development" &&
                error instanceof Error &&
                error.message.includes("Cookies can only be modified")
              ) {
                // Suppress expected warning - middleware handles session refresh
                // Uncomment below for debugging if needed:
                // console.debug(
                //   "[Supabase Server Client] Cookie refresh attempted in Server Component (expected, handled by middleware)"
                // );
              } else {
                // Log unexpected errors
                logger.warn("Failed to set cookies in Server Component", {
                  error,
                });
              }
            }
          },
        },
      }
    );
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    logger.error("Failed to create server client", { error });
    throw error;
  }
};

/**
 * Request-scoped Supabase server client.
 * Backed by React.cache() so the client is created once per server request,
 * regardless of how many RSC loaders or server functions call it.
 * Use this instead of createSupabaseServerClient() in all RSC / server code.
 */
export const getServerClient = cache(createSupabaseServerClient);
