import { AppError, isAppError } from "@/shared/errors/appError";
import { REPOSITORY_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import type {
  ConstraintError,
  DatabaseError,
  NotFoundError,
} from "@/shared/errors/repositoryError";

/**
 * Type guard to check if an error is a repository-layer {@link AppError}.
 */
export const isRepositoryError = (error: unknown): error is AppError => {
  if (!isAppError(error)) {
    return false;
  }
  return (
    error.code === REPOSITORY_ERROR_CODE.NOT_FOUND ||
    error.code === REPOSITORY_ERROR_CODE.CONSTRAINT_VIOLATION ||
    error.code === REPOSITORY_ERROR_CODE.DATABASE_ERROR
  );
};

/**
 * Type guard to check if an error is a NotFoundError.
 */
export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return (
    isRepositoryError(error) &&
    error.code === REPOSITORY_ERROR_CODE.NOT_FOUND &&
    error.context !== undefined &&
    typeof error.context.entityType === "string" &&
    typeof error.context.entityId === "string"
  );
};

/**
 * Type guard to check if an error is a ConstraintError.
 */
export const isConstraintError = (error: unknown): error is ConstraintError => {
  return (
    isRepositoryError(error) &&
    error.code === REPOSITORY_ERROR_CODE.CONSTRAINT_VIOLATION &&
    error.context !== undefined &&
    typeof error.context.constraint === "string"
  );
};

/**
 * Type guard to check if an error is a DatabaseError.
 */
export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return (
    isRepositoryError(error) &&
    error.code === REPOSITORY_ERROR_CODE.DATABASE_ERROR
  );
};
