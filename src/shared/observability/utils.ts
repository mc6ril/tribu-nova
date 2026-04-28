/**
 * Utility functions for logging implementation.
 */

import type { LogMeta } from "@/shared/observability/logger.port";

/**
 * Safely stringifies a value to JSON, handling circular references, BigInt, and functions.
 * Never throws - returns fallback string if serialization fails.
 * Uses WeakSet to detect and cut circular references without throwing.
 * @param value - Value to stringify
 * @returns JSON string or fallback string
 */
export const safeJsonStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(value, (_key, val) => {
      // Handle BigInt
      if (typeof val === "bigint") {
        return val.toString();
      }

      // Handle functions
      if (typeof val === "function") {
        return "[Function]";
      }

      // Handle undefined (let JSON.stringify omit it naturally)
      if (val === undefined) {
        return undefined;
      }

      // Handle circular references using WeakSet
      if (val && typeof val === "object") {
        if (seen.has(val as object)) {
          return "[Circular]";
        }
        seen.add(val as object);
      }

      return val;
    });
  } catch (error) {
    // Fallback for other serialization errors
    try {
      return JSON.stringify({
        error: "Failed to serialize log data",
        message: error instanceof Error ? error.message : String(error),
      });
    } catch {
      // Ultimate fallback
      return '{"error":"Failed to serialize log data"}';
    }
  }
};

/**
 * Sanitizes metadata for JSON serialization.
 * - Removes undefined values
 * - Converts Date to ISO string
 * - Preserves Error instances (extraction happens separately)
 * - Ensures all values are JSON-safe
 * @param meta - Metadata to sanitize
 * @returns Sanitized metadata
 */
export const sanitizeMeta = (meta: LogMeta): LogMeta => {
  const sanitized: LogMeta = {};

  for (const [key, value] of Object.entries(meta)) {
    // Skip undefined values
    if (value === undefined) {
      continue;
    }

    // Convert Date to ISO string
    if (value instanceof Date) {
      sanitized[key] = value.toISOString();
      continue;
    }

    // Preserve Error instances (extraction happens in extractError, not here)
    if (value instanceof Error) {
      sanitized[key] = value;
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      try {
        // Check if it's a plain object (not a class instance)
        if (Object.getPrototypeOf(value) === Object.prototype) {
          sanitized[key] = sanitizeMeta(value as LogMeta);
        } else {
          // Class instance - convert to plain object representation
          sanitized[key] = String(value);
        }
      } catch {
        // Fallback for objects that can't be inspected
        sanitized[key] = String(value);
      }
      continue;
    }

    // Recursively sanitize arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (item instanceof Date) {
          return item.toISOString();
        }
        if (item instanceof Error) {
          // Preserve Error instances in arrays too
          return item;
        }
        if (item && typeof item === "object") {
          // Only sanitize if it's a plain object
          try {
            if (Object.getPrototypeOf(item) === Object.prototype) {
              return sanitizeMeta(item as LogMeta);
            }
            // Class instance or other object - convert to string
            return String(item);
          } catch {
            return String(item);
          }
        }
        // Keep primitives as-is
        return item;
      });
      continue;
    }

    // Keep primitive values and other JSON-safe values as-is
    sanitized[key] = value;
  }

  return sanitized;
};

/**
 * Normalizes a scope string to kebab-case.
 * @param scope - Scope string to normalize
 * @returns Normalized scope string
 */
export const normalizeScope = (scope: string): string => {
  return scope
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
};

/**
 * Joins a parent and child scope string.
 * @param parent - Parent scope string
 * @param child - Child scope string
 * @returns Joined scope string
 */
export const joinScope = (parent: string, child: string): string => {
  const p = normalizeScope(parent);
  const c = normalizeScope(child);
  return p ? (c ? `${p}.${c}` : p) : c;
};
