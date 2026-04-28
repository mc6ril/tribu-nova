import {
  createConstraintError,
  createDatabaseError,
  createNotFoundError,
  type RepositoryErrorUnion,
} from "@/shared/errors/repositoryError";
import { isNetworkError } from "@/shared/utils/errorHandling";

/**
 * Maps Supabase errors to domain repository errors.
 *
 * This function converts infrastructure-specific errors (Supabase, network, etc.)
 * into domain-level errors that can be handled consistently by usecases.
 *
 * Error Mapping Strategy:
 * 1. Network errors (connection failures, timeouts) → DatabaseError
 * 2. Not found errors (PGRST116) → NotFoundError
 * 3. Constraint violations (23505, 23503, 23514) → ConstraintError
 * 4. RLS policy violations (42501) → ConstraintError with RLS_POLICY_VIOLATION
 * 5. Generic Supabase errors → DatabaseError
 * 6. Generic Error instances → DatabaseError
 * 7. Unknown errors → DatabaseError (fallback)
 *
 * @param error - Supabase error or unknown error
 * @param entityType - Type of entity for context (e.g., "Project", "Ticket")
 * @param entityId - Optional entity ID for NotFoundError
 * @returns Domain repository error union
 */
export const mapSupabaseError = (
  error: unknown,
  entityType: string = "Entity",
  entityId?: string
): RepositoryErrorUnion => {
  // Check for network errors first (before Supabase-specific errors)
  // Network errors include connection failures, timeouts, and fetch failures
  if (isNetworkError(error)) {
    const networkError = error as Error;
    return createDatabaseError(
      `Network error: ${networkError.message}`,
      networkError
    );
  }

  // Handle Supabase PostgrestError
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    "details" in error
  ) {
    const supabaseError = error as {
      code: string;
      message: string;
      details?: string;
      hint?: string;
    };
    const normalizedMessage = supabaseError.message?.trim() ?? "";

    if (normalizedMessage === "LAST_ADMIN_REQUIRED") {
      return createConstraintError(
        "LAST_ADMIN_REQUIRED",
        normalizedMessage || supabaseError.details || undefined
      );
    }

    if (supabaseError.code === "P0002") {
      return createConstraintError(
        "INVITATION_ALREADY_USED",
        normalizedMessage || supabaseError.details || undefined
      );
    }

    if (supabaseError.code === "P0003") {
      return createConstraintError(
        "INVITATION_EXPIRED",
        normalizedMessage || supabaseError.details || undefined
      );
    }

    if (
      supabaseError.code === "P0004" ||
      normalizedMessage === "Already a member of this project"
    ) {
      return createConstraintError(
        "INVITATION_ALREADY_MEMBER",
        normalizedMessage || supabaseError.details || undefined
      );
    }

    // Map specific Supabase error codes to domain errors
    // PGRST116: Not found (no rows returned)
    if (supabaseError.code === "PGRST116") {
      // Use Supabase-provided message for debugging instead of a user-facing message.
      const debugMessage =
        supabaseError.message ||
        supabaseError.details ||
        `Supabase error: ${supabaseError.code}`;
      return createNotFoundError(
        entityType,
        entityId || "unknown",
        debugMessage
      );
    }

    // Constraint violation errors
    // 23505: Unique constraint violation
    // 23503: Foreign key constraint violation
    // 23514: Check constraint violation

    if (
      supabaseError.code === "23505" ||
      supabaseError.code === "23503" ||
      supabaseError.code === "23514"
    ) {
      // Constraint violation (unique, foreign key, check)
      return createConstraintError(
        supabaseError.code,
        supabaseError.message || supabaseError.details || undefined
      );
    }

    // RLS (Row-Level Security) policy violations
    // 42501: Insufficient privilege (RLS policy violation)
    // These should be mapped to ConstraintError as they represent policy constraints
    if (
      supabaseError.code === "42501" ||
      (supabaseError.message &&
        supabaseError.message.toLowerCase().includes("row-level security"))
    ) {
      // Use consistent constraint name for RLS violations
      // The presentation layer will translate the message based on the constraint code
      const constraint = "RLS_POLICY_VIOLATION";

      // Use original Supabase message for debugging/logging purposes
      // The presentation layer will handle user-friendly translation based on constraint
      const debugMessage =
        supabaseError.message || supabaseError.details || undefined;

      return createConstraintError(constraint, debugMessage);
    }

    // Generic database error - keep original Supabase message for debugging.
    // This catches any other Supabase error codes not specifically handled above
    const debugMessage =
      supabaseError.message ||
      supabaseError.details ||
      `Supabase error: ${supabaseError.code}`;

    return createDatabaseError(debugMessage, supabaseError);
  }

  // Handle generic Error instances (e.g., TypeError, ReferenceError)
  // These are mapped to DatabaseError with the error message preserved
  if (error instanceof Error) {
    return createDatabaseError(error.message, error);
  }

  // Fallback for unknown error types (null, undefined, primitives, etc.)
  // This ensures we always return a domain error, never throw infrastructure errors
  return createDatabaseError("Unknown repository error", error);
};
