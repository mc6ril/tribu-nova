/**
 * JSON console logger implementation.
 * Pure implementation with no React dependencies.
 */

import type {
  LogError,
  Logger,
  LogLevel,
  LogMeta,
} from "@/shared/observability/logger.port";
import { isArray, isPlainObject } from "@/shared/utils";

import { shouldLog } from "./config";
import type { LogConfig, StructuredLog } from "./types";
import { joinScope, safeJsonStringify } from "./utils";
import { sanitizeMeta } from "./utils";

/**
 * Keys that should be redacted from logs (case-insensitive).
 */
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "set-cookie",
]);

/**
 * Extracts traceId from metadata.
 * @param meta - Metadata to extract traceId from
 * @returns TraceId if present, undefined otherwise
 */
const extractTraceId = (meta: LogMeta): string | undefined => {
  return typeof meta.traceId === "string" ? meta.traceId : undefined;
};

/**
 * Removes traceId from metadata.
 * @param meta - Metadata to remove traceId from
 * @returns Metadata without traceId
 */
const removeTraceIdFromMeta = (meta: LogMeta): LogMeta => {
  const { traceId: _, ...rest } = meta;
  return rest;
};

/**
 * Redacts sensitive values from metadata.
 * @param meta - Metadata to redact
 * @returns Redacted metadata
 */
const redactSensitiveMeta = (meta: LogMeta): LogMeta => {
  return redactSensitiveValues(meta) as LogMeta;
};

/**
 * Checks if a key should be redacted.
 * @param key - Key to check
 * @returns true if key should be redacted
 */
const isSensitiveKey = (key: string): boolean => {
  return SENSITIVE_KEYS.has(key.toLowerCase());
};

/**
 * Recursively redacts sensitive values from an object or array.
 *
 * - Redacts values whose keys match sensitive keys (e.g. password, token)
 * - Recursively processes nested objects and arrays
 * - Preserves Error instances (handled separately by the logger)
 * - Leaves primitive values untouched
 *
 * This function is pure and never mutates the input.
 *
 * @param value - Any value to sanitize (object, array, or primitive)
 * @returns A new value with sensitive fields redacted
 */
const redactSensitiveValues = (value: unknown): unknown => {
  // Preserve Error instances (handled later by logger)
  if (value instanceof Error) {
    return value;
  }

  // Handle arrays
  if (isArray(value)) {
    return value.map(redactSensitiveValues);
  }

  // Handle objects
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactSensitiveValues(val);
      }
    }

    return result;
  }

  // Primitives (string, number, boolean, null, undefined)
  return value;
};

/**
 * Extracts error from meta if present and formats it.
 * @param meta - Metadata that may contain error
 * @returns Structured error if meta.error is an Error, undefined otherwise
 */
const extractError = (meta: LogMeta): LogError | undefined => {
  const error = meta.error;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return undefined;
};

/**
 * Removes error from meta to avoid duplication.
 * @param meta - Metadata that may contain error
 * @returns New meta object without error field
 */
const removeErrorFromMeta = (meta: LogMeta): LogMeta => {
  const { error: _, ...rest } = meta;
  return rest;
};

/**
 * Creates structured log object.
 * @param level - Log level
 * @param scope - Logger scope
 * @param message - Log message
 * @param meta - Merged metadata
 * @returns Structured log object
 */
const createStructuredLog = (
  level: LogLevel,
  scope: string,
  message: string,
  meta: LogMeta
): StructuredLog => {
  const error = extractError(meta);
  let cleanedMeta = error ? removeErrorFromMeta(meta) : meta;

  const traceId = extractTraceId(cleanedMeta);
  // Remove traceId from meta if it exists (even if empty string) to avoid duplication
  if (traceId !== undefined) {
    cleanedMeta = removeTraceIdFromMeta(cleanedMeta);
  }

  return {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    meta: cleanedMeta,
    ...(error && { error }),
    // Only include traceId in structured log if it's a non-empty string
    ...(traceId && traceId.length > 0 && { traceId }),
  };
};

/**
 * Gets console method for log level.
 * @param level - Log level
 * @returns Console method name
 */
const getConsoleMethod = (level: LogLevel): keyof Console => {
  switch (level) {
    case "debug":
      return "debug";
    case "info":
      return "info";
    case "warn":
      return "warn";
    case "error":
      return "error";
    default:
      return "log";
  }
};

/**
 * JSON console logger implementation.
 * Logs structured JSON to console with level filtering and meta sanitization.
 */
export class JsonConsoleLogger implements Logger {
  private readonly scope: string;
  private readonly baseMeta: LogMeta;
  private readonly config: LogConfig;

  /**
   * Creates a new JSON console logger.
   * @param scope - Logger scope
   * @param baseMeta - Base metadata to merge with all log calls
   * @param config - Log configuration
   */
  constructor(scope: string, baseMeta: LogMeta, config: LogConfig) {
    this.scope = scope;
    this.baseMeta = baseMeta;
    this.config = config;
  }

  /**
   * Merges base meta with provided meta.
   * Provided meta takes precedence over baseMeta.
   * Error instances are preserved by sanitizeMeta, so extraction works correctly.
   * @param meta - Optional metadata from log call
   * @returns Merged and sanitized metadata
   */
  private mergeMeta(meta?: LogMeta): LogMeta {
    // Merge first, then sanitize
    // sanitizeMeta preserves Error instances, so extraction in createStructuredLog works
    const merged = {
      ...this.baseMeta,
      ...meta,
    };

    return sanitizeMeta(merged);
  }

  /**
   * Logs a message at the specified level.
   * @param level - Log level
   * @param message - Log message
   * @param meta - Optional metadata
   */
  private log(level: LogLevel, message: string, meta?: LogMeta): void {
    if (!shouldLog(level, this.config.level)) {
      return;
    }

    if (!this.config.enableConsole) {
      return;
    }

    const mergedMeta = this.mergeMeta(meta);
    // redactSensitiveValues handles arrays, but mergedMeta is always Record<string, unknown>
    const sanitizedMeta = redactSensitiveMeta(mergedMeta);
    const structuredLog = createStructuredLog(
      level,
      this.scope,
      message,
      sanitizedMeta
    );
    const jsonString = safeJsonStringify(structuredLog);

    const consoleMethod = getConsoleMethod(level);
    // Console methods are callable, but TypeScript needs help with the union type
    if (consoleMethod === "debug") {
      console.debug(jsonString);
    } else if (consoleMethod === "info") {
      console.info(jsonString);
    } else if (consoleMethod === "warn") {
      console.warn(jsonString);
    } else if (consoleMethod === "error") {
      console.error(jsonString);
    } else {
      console.log(jsonString);
    }
  }

  debug(message: string, meta?: LogMeta): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.log("error", message, meta);
  }

  child(scope: string, baseMeta?: LogMeta): Logger {
    const childScope = joinScope(this.scope, scope);
    const childBaseMeta = sanitizeMeta({
      ...this.baseMeta,
      ...(baseMeta ?? {}),
    });

    return new JsonConsoleLogger(childScope, childBaseMeta, this.config);
  }
}
