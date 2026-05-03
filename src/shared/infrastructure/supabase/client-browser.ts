import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { throwProgrammingError } from "@/shared/errors/programmingError";
import type { Database } from "@/shared/infrastructure/supabase/database.types";
import { createLoggerFactory } from "@/shared/observability";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
let browserClientSingleton: SupabaseClient<Database> | null = null;
const logger = createLoggerFactory().forScope(
  "infrastructure.supabase-browser-client"
);

/** Validate required env vars; throw with helpful message on missing. */
const validateEnvironmentVariables = (): void => {
  logger.info("validateEnvironmentVariables entry", {
    function: "validateEnvironmentVariables",
    hasSupabaseUrl: Boolean(SUPABASE_URL),
    hasSupabasePublishableKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
  });

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
 * Create Supabase client for browser (Client Components).
 * Uses @supabase/ssr to handle sessions via cookies.
 *
 * Note: createBrowserClient automatically handles cookies via document.cookie,
 * so no explicit cookie configuration is needed. The client reads cookies
 * on each request to ensure fresh session state.
 *
 * @returns Supabase client configured for browser usage
 */
export const createSupabaseBrowserClient = () => {
  logger.info("createSupabaseBrowserClient entry", {
    function: "createSupabaseBrowserClient",
    hasSingleton: Boolean(browserClientSingleton),
  });

  if (browserClientSingleton) {
    return browserClientSingleton;
  }

  validateEnvironmentVariables();
  browserClientSingleton = createBrowserClient<Database>(
    SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY!
  );

  return browserClientSingleton;
};

/**
 * Test helper to reset singleton between isolated test runs.
 */
export const resetSupabaseBrowserClientForTests = (): void => {
  logger.info("resetSupabaseBrowserClientForTests entry", {
    function: "resetSupabaseBrowserClientForTests",
    nodeEnv: process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV === "test") {
    browserClientSingleton = null;
  }
};
