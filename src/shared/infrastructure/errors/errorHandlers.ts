import type { RepositoryErrorUnion } from "@/shared/errors/repositoryError";
import { isRepositoryError } from "@/shared/errors/repositoryError.guards";
import { createLoggerFactory } from "@/shared/observability";

import { mapSupabaseError } from "./repositoryErrorMapper";

const loggerFactory = createLoggerFactory();
const logger = loggerFactory.forScope("infrastructure.repository-errors");

/**
 * Standardized error handling for repository methods.
 * Re-throws domain repository errors and wraps unknown errors.
 *
 * This function:
 * 1. Logs all repository errors with context (entity type, ID, error details)
 * 2. Re-throws domain repository errors (already mapped)
 * 3. Maps and throws unknown errors (Supabase, network, etc.)
 *
 * Error logging preserves original error context for debugging while
 * ensuring domain layer receives consistent error types.
 *
 * @param error - Error caught in try/catch block
 * @param entityType - Type of entity for context (e.g., "Project", "Ticket")
 * @param entityId - Optional entity ID for NotFoundError mapping
 * @throws Domain repository error (if already a RepositoryError) or mapped repository error
 */
export const handleRepositoryError = (
  error: unknown,
  entityType: string = "Entity",
  entityId?: string
): never => {
  // Re-throw domain repository errors (use type guard instead of code list)
  if (isRepositoryError(error)) {
    const repositoryError = error as RepositoryErrorUnion;
    // Log domain repository error with context
    logger.error("Repository error", {
      error,
      entityType,
      entityId,
      errorCode: repositoryError.code,
      debugMessage: repositoryError.debugMessage,
    });
    throw error;
  }

  // Map unknown errors to domain errors
  const mappedError = mapSupabaseError(error, entityType, entityId);

  // Log mapped error with original error context
  logger.error("Repository error (mapped from infrastructure error)", {
    error,
    mappedError,
    entityType,
    entityId,
    errorCode: mappedError.code,
    debugMessage: mappedError.debugMessage,
  });

  throw mappedError;
};
