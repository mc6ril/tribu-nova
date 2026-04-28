/**
 * Domain rule violations expressed as {@link AppError}.
 */

import type { AppError } from "@/shared/errors/appError";
import { createAppError } from "@/shared/errors/appError";
import type { AppErrorCode } from "@/shared/errors/appErrorCodes";

/**
 * @deprecated Use {@link AppError} directly; kept for call-site clarity.
 */
export type DomainRuleError = AppError;

export const createDomainRuleError = (
  code: AppErrorCode,
  debugMessage?: string,
  field?: string
): AppError =>
  createAppError(code, {
    debugMessage,
    ...(field !== undefined ? { context: { field } } : {}),
  });
