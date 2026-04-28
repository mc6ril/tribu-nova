/**
 * Repository-layer errors expressed as {@link AppError}.
 */

import type { AppError } from "@/shared/errors/appError";
import { createAppError } from "@/shared/errors/appError";
import { REPOSITORY_ERROR_CODE } from "@/shared/errors/appErrorCodes";

export type NotFoundError = AppError & { code: "NOT_FOUND" };

export type ConstraintError = AppError & { code: "CONSTRAINT_VIOLATION" };

export type DatabaseError = AppError & { code: "DATABASE_ERROR" };

export type RepositoryErrorUnion =
  | NotFoundError
  | ConstraintError
  | DatabaseError;

export const createNotFoundError = (
  entityType: string,
  entityId: string,
  debugMessage?: string
): NotFoundError =>
  createAppError(REPOSITORY_ERROR_CODE.NOT_FOUND, {
    debugMessage: debugMessage ?? `${entityType} with id ${entityId} not found`,
    context: { entityType, entityId },
  }) as NotFoundError;

export const createConstraintError = (
  constraint: string,
  debugMessage?: string
): ConstraintError =>
  createAppError(REPOSITORY_ERROR_CODE.CONSTRAINT_VIOLATION, {
    debugMessage:
      debugMessage ?? `Database constraint violation: ${constraint}`,
    context: { constraint },
  }) as ConstraintError;

export const createDatabaseError = (
  debugMessage: string,
  originalError?: unknown
): DatabaseError =>
  createAppError(REPOSITORY_ERROR_CODE.DATABASE_ERROR, {
    debugMessage,
    ...(originalError !== undefined ? { context: { originalError } } : {}),
  }) as DatabaseError;
