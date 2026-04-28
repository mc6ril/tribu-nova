import { z, ZodError } from "zod";

import { isNonEmptyString } from "./guards";

/**
 * Result type for safe validation operations.
 * Uses discriminated union for type safety - when success is true, data is required;
 * when success is false, error is required.
 *
 * @template T The type of the validated data
 */
export type SafeResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ZodError;
    };

/**
 * Validates data against a Zod schema and throws on error.
 * Provides consistent error handling for validation operations.
 *
 * @template T The type of the validated data
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data of type T
 * @throws ZodError if validation fails
 *
 * @example
 * ```ts
 * const schema = z.object({ name: z.string() });
 * const data = validateWithSchema(schema, { name: "John" });
 * ```
 */
export const validateWithSchema = <T>(
  schema: z.ZodType<T>,
  data: unknown
): T => {
  return schema.parse(data);
};

/**
 * Safely validates data against a Zod schema without throwing.
 * Returns a result object with success status and either data or error.
 *
 * @template T The type of the validated data
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns SafeResult with success status, data, or error
 *
 * @example
 * ```ts
 * const schema = z.object({ name: z.string() });
 * const result = safeValidateWithSchema(schema, { name: "John" });
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export const safeValidateWithSchema = <T>(
  schema: z.ZodType<T>,
  data: unknown
): SafeResult<T> => {
  const result = schema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  return {
    success: false,
    error: result.error,
  };
};

/**
 * Formats Zod validation errors into a field-to-message mapping.
 * Handles empty paths (global errors) and nested paths.
 *
 * @param error - ZodError to format
 * @returns Record mapping field paths to error messages
 *
 * @example
 * ```ts
 * const error = // ... ZodError
 * const errors = formatValidationErrors(error);
 * // { "email": "Invalid email format", "profile.name": "Required" }
 * ```
 */
export const formatValidationErrors = (
  error: ZodError
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.length === 0 ? "_global" : issue.path.join(".");
    // Use last error for fields with multiple errors
    errors[key] = issue.message;
  }

  return errors;
};

/**
 * Email validation schema.
 * Reused across all email validation calls for performance.
 */
const emailSchema = z.string().email();

/**
 * URL validation schema.
 * Reused across all URL validation calls for performance.
 */
const urlSchema = z.string().url();

/**
 * Validates email format using Zod.
 * More reliable than regex and consistent with existing codebase validation.
 *
 * @param email - Email string to validate
 * @returns true if email format is valid, false otherwise
 *
 * @example
 * ```ts
 * validateEmail("user@example.com"); // true
 * validateEmail("invalid"); // false
 * ```
 */
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

/**
 * Validates URL format using Zod.
 * More reliable than regex and consistent with existing codebase validation.
 *
 * @param url - URL string to validate
 * @returns true if URL format is valid, false otherwise
 *
 * @example
 * ```ts
 * validateUrl("https://example.com"); // true
 * validateUrl("invalid"); // false
 * ```
 */
export const validateUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success;
};

/**
 * Checks if a value is required (non-empty).
 * Currently focused on text inputs - uses isNonEmptyString for consistency.
 *
 * @param value - Value to check
 * @returns true if value is required (non-empty), false otherwise
 *
 * @example
 * ```ts
 * validateRequired("text"); // true
 * validateRequired(""); // false
 * validateRequired(null); // false
 * ```
 */
export const validateRequired = (value: unknown): boolean => {
  return isNonEmptyString(value);
};
