import { AUTH_ERROR_CODES_ARRAY } from "@/shared/errors/appErrorCodes";
import { createLoggerFactory } from "@/shared/observability";
import { hasErrorCode } from "@/shared/utils/guards";

import { mapSupabaseAuthError } from "@/domains/auth/infrastructure/supabase/AuthMapper.supabase";

const loggerFactory = createLoggerFactory();
const logger = loggerFactory.forScope("infrastructure.supabase-auth-errors");

/**
 * Re-throws known auth errors and maps unknown Supabase/provider errors into
 * stable application auth error codes.
 */
export const handleAuthError = (error: unknown): never => {
  if (hasErrorCode(error, [...AUTH_ERROR_CODES_ARRAY])) {
    logger.warn("Authentication error", {
      error,
      errorCode: error.code,
    });
    throw error;
  }

  const mappedError = mapSupabaseAuthError(error);

  logger.warn("Authentication error (mapped from infrastructure error)", {
    error,
    mappedError,
    errorCode: mappedError.code,
  });

  throw mappedError;
};
