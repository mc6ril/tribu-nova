/**
 * Logger factory implementation.
 * Creates scoped loggers following the LoggerFactory port interface.
 */

import type {
  Logger,
  LoggerFactory,
  LogMeta,
} from "@/shared/observability/logger.port";

import { getLogConfig } from "./config";
import { JsonConsoleLogger } from "./jsonConsoleLogger";
import { normalizeScope, sanitizeMeta } from "./utils";

/**
 * Creates a logger factory instance.
 * @returns LoggerFactory implementation
 */
export const createLoggerFactory = (): LoggerFactory => {
  const config = getLogConfig();

  return {
    forScope(scope: string, baseMeta?: LogMeta): Logger {
      const sanitizedBaseMeta = baseMeta ? sanitizeMeta(baseMeta) : {};
      const normalizedScope = normalizeScope(scope);
      return new JsonConsoleLogger(normalizedScope, sanitizedBaseMeta, config);
    },
  };
};
