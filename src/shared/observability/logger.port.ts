/**
 * Logger port interface following Clean Architecture principles.
 * No dependencies - pure TypeScript types for testability.
 */

/**
 * Log levels in order of severity.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Log metadata - always an object (never undefined in implementation).
 * Can contain any data (sanitization happens in implementation).
 * Including optional error and traceId.
 */
export type LogMeta = Record<string, unknown>;

/**
 * Structured error format for logging.
 */
export type LogError = {
  name: string;
  message: string;
  stack?: string;
};

/**
 * Logger interface for structured logging.
 * All methods accept optional meta that is always treated as an object.
 */
export type Logger = {
  /**
   * Log a debug message.
   * @param message - Log message
   * @param meta - Optional metadata (always treated as object)
   */
  debug(message: string, meta?: LogMeta): void;

  /**
   * Log an info message.
   * @param message - Log message
   * @param meta - Optional metadata (always treated as object)
   */
  info(message: string, meta?: LogMeta): void;

  /**
   * Log a warning message.
   * @param message - Log message
   * @param meta - Optional metadata (always treated as object)
   */
  warn(message: string, meta?: LogMeta): void;

  /**
   * Log an error message.
   * @param message - Log message
   * @param meta - Optional metadata (always treated as object)
   *   If meta.error is an Error instance, it will be extracted to structured error field.
   */
  error(message: string, meta?: LogMeta): void;

  /**
   * Create a child logger with additional scope and base metadata.
   * Scope is concatenated with dot separator: "parent.child".
   * @param scope - Additional scope segment
   * @param baseMeta - Base metadata to merge with all log calls
   * @returns New logger instance with merged scope and baseMeta
   */
  child(scope: string, baseMeta?: LogMeta): Logger;
};

/**
 * Logger factory interface for creating scoped loggers.
 */
export type LoggerFactory = {
  /**
   * Create a logger for a specific scope.
   * @param scope - Logger scope (e.g., "workspace", "project.board")
   * @param baseMeta - Base metadata to merge with all log calls
   * @returns Logger instance for the specified scope
   */
  forScope(scope: string, baseMeta?: LogMeta): Logger;
};
