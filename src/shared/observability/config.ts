/**
 * Logging configuration based on environment.
 */

import type { LogLevel } from "@/shared/observability/logger.port";

import type { LogConfig } from "./types";

/**
 * Valid log levels for whitelist validation.
 */
const VALID_LOG_LEVELS: readonly LogLevel[] = Object.freeze([
  "debug",
  "info",
  "warn",
  "error",
]);

/**
 * Log level hierarchy for filtering.
 * Lower index = lower priority (debug < info < warn < error).
 */
const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = Object.freeze({
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
});

/**
 * Safely parses log level from environment variable with whitelist validation.
 * @param value - Environment variable value
 * @returns Valid log level or null if invalid
 */
const parseLogLevel = (value: string | undefined): LogLevel | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().trim();
  if (VALID_LOG_LEVELS.includes(normalized as LogLevel)) {
    return normalized as LogLevel;
  }

  return null;
};

/**
 * Gets the default log level based on environment.
 * @returns Default log level (debug for development, info for production)
 */
const getDefaultLogLevel = (): LogLevel => {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? "debug" : "info";
};

/**
 * Gets the configured log level from environment or defaults.
 * @returns Configured log level
 */
export const getLogLevel = (): LogLevel => {
  const envLevel = parseLogLevel(process.env.NEXT_PUBLIC_LOG_LEVEL);
  return envLevel ?? getDefaultLogLevel();
};

/**
 * Checks if a log level should be logged based on configuration.
 * @param level - Log level to check
 * @param configLevel - Configured minimum log level
 * @returns true if level should be logged, false otherwise
 */
export const shouldLog = (level: LogLevel, configLevel: LogLevel): boolean => {
  return LOG_LEVEL_HIERARCHY[level] >= LOG_LEVEL_HIERARCHY[configLevel];
};

/**
 * Gets the complete log configuration.
 * @returns Log configuration object
 */
export const getLogConfig = (): LogConfig => {
  return {
    level: getLogLevel(),
    enableConsole: true, // Can be extended with env var if needed
  };
};
