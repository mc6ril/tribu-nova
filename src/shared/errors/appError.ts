import {
  APP_ERROR_CODES,
  type AppErrorCode,
} from "@/shared/errors/appErrorCodes";

/**
 * Structured context for logging and i18n interpolation only.
 * Must not contain user-facing prose.
 */
export type AppErrorContext = {
  entityType?: string;
  entityId?: string;
  constraint?: string;
  field?: string;
  originalError?: unknown;
};

/**
 * Canonical application error shape. All domain and infrastructure errors
 * should use this type; user-visible text is resolved via i18n from {@link AppError.code}.
 */
export type AppError = {
  readonly _tag: "AppError";
  readonly code: AppErrorCode;
  readonly debugMessage?: string;
  readonly context?: AppErrorContext;
};

type CreateAppErrorOptions = {
  debugMessage?: string;
  context?: AppErrorContext;
};

export const createAppError = (
  code: AppErrorCode,
  options: CreateAppErrorOptions = {}
): AppError => {
  const { debugMessage, context } = options;
  return {
    _tag: "AppError",
    code,
    ...(debugMessage !== undefined ? { debugMessage } : {}),
    ...(context !== undefined ? { context } : {}),
  };
};

export const isAppError = (error: unknown): error is AppError => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as Record<string, unknown>;
  if (record._tag !== "AppError") {
    return false;
  }
  if (typeof record.code !== "string") {
    return false;
  }
  return APP_ERROR_CODES.includes(record.code as AppErrorCode);
};

/**
 * Converts legacy plain error objects (code + fields) into {@link AppError}.
 * Used during migration and at the i18n boundary for unknown thrown values.
 */
export const normalizeToAppError = (error: unknown): AppError | null => {
  if (isAppError(error)) {
    return error;
  }

  if (!error || typeof error !== "object") {
    return null;
  }

  const record = error as Record<string, unknown>;
  if (typeof record.code !== "string") {
    return null;
  }

  if (!APP_ERROR_CODES.includes(record.code as AppErrorCode)) {
    return null;
  }

  const code = record.code as AppErrorCode;
  const context: AppErrorContext = {};

  if (typeof record.entityType === "string") {
    context.entityType = record.entityType;
  }
  if (typeof record.entityId === "string") {
    context.entityId = record.entityId;
  }
  if (typeof record.constraint === "string") {
    context.constraint = record.constraint;
  }
  if (typeof record.field === "string") {
    context.field = record.field;
  }
  if ("originalError" in record) {
    context.originalError = record.originalError;
  }

  return createAppError(code, {
    debugMessage:
      typeof record.debugMessage === "string" ? record.debugMessage : undefined,
    context: Object.keys(context).length > 0 ? context : undefined,
  });
};

/**
 * Returns the stable {@link AppErrorCode} when {@link error} is or normalizes to an {@link AppError}.
 */
export const getAppErrorCode = (error: unknown): AppErrorCode | undefined => {
  return normalizeToAppError(error)?.code;
};

export type AppErrorLogPayload = {
  code: AppErrorCode;
  debugMessage?: string;
  context?: AppErrorContext;
};

export const toLogPayload = (error: AppError): AppErrorLogPayload => ({
  code: error.code,
  ...(error.debugMessage !== undefined
    ? { debugMessage: error.debugMessage }
    : {}),
  ...(error.context !== undefined ? { context: error.context } : {}),
});
