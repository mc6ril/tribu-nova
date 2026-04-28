import { ZodError } from "zod";

/**
 * Type guard to check if an error is a Zod validation error.
 *
 * @param error - Error to check
 * @returns true if error is a ZodError, false otherwise
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     // Handle validation error
 *   }
 * }
 * ```
 */
export const isValidationError = (error: unknown): error is ZodError => {
  return error instanceof ZodError;
};

/**
 * Checks if an error is a network error.
 * Minimal detection - network error detection in JavaScript is fragile.
 * Only detects TypeError with fetch/network-related messages.
 *
 * @param error - Error to check
 * @returns true if error appears to be a network error, false otherwise
 *
 * @example
 * ```ts
 * try {
 *   await fetch(url);
 * } catch (error) {
 *   if (isNetworkError(error)) {
 *     // Handle network error
 *   }
 * }
 * ```
 *
 * @remarks
 * Network error detection is limited and may not catch all network errors.
 * This function uses minimal heuristics (TypeError with fetch/network keywords).
 * Different environments (browser, Node.js, Supabase) may produce different error patterns.
 */
export const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof TypeError && /fetch|network/i.test(error.message || "")
  );
};
