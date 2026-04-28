/**
 * Internal types for structured logging implementation.
 */

import type {
  LogError,
  LogLevel,
  LogMeta,
} from "@/shared/observability/logger.port";

/**
 * Structured log format for JSON output.
 */
export type StructuredLog = {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta: LogMeta;
  error?: LogError;
  traceId?: string;
};

/**
 * Log configuration.
 */
export type LogConfig = {
  level: LogLevel;
  enableConsole: boolean;
};
