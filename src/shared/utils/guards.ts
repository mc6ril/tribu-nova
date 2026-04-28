/**
 * Type guards and validation utilities.
 * Provides simple, reusable functions for common validation patterns.
 */

import { throwProgrammingError } from "@/shared/errors/programmingError";

/**
 * Type guard to check if a value is an object (not null, not array).
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

/**
 * Type guard to check if a value is a non-empty string.
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Type guard to check if a value is a string (can be empty).
 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

/**
 * Type guard to check if a value is a number.
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

/**
 * Type guard to check if a value is a boolean.
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

/**
 * Type guard to check if a value is an array.
 * @template T The element type of the array
 * @param value - Value to check
 * @returns true if value is an array
 */
export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

/**
 * Type guard to check if a value is defined (not undefined or null).
 * @template T The type of the value when defined
 * @param value - Value to check
 * @returns true if value is not undefined or null
 */
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

/**
 * Type guard to check if a value is not null.
 * @template T The type of the value when not null
 * @param value - Value to check
 * @returns true if value is not null
 */
export const isNotNull = <T>(value: T | null): value is T => {
  return value !== null;
};

/**
 * Type guard to check if a value is not undefined.
 * @template T The type of the value when not undefined
 * @param value - Value to check
 * @returns true if value is not undefined
 */
export const isNotUndefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

/**
 * Type guard to check if an error object has a code property.
 * Useful for checking domain errors vs unknown errors.
 */
export const isErrorWithCode = (
  error: unknown
): error is { code: string; [key: string]: unknown } => {
  return isObject(error) && "code" in error && typeof error.code === "string";
};

/**
 * Checks if an error has one of the specified error codes.
 * Useful for determining if an error should be re-thrown vs wrapped.
 */
export const hasErrorCode = (
  error: unknown,
  codes: string[]
): error is { code: string; [key: string]: unknown } => {
  if (!isErrorWithCode(error)) {
    return false;
  }
  return codes.includes(error.code);
};

/**
 * Checks if a value is a non-empty array.
 */
export const isNonEmptyArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> => {
  if (!isObject(value)) {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
};

/**
 * Converts a value to a Date object.
 * Handles both Date objects and date strings.
 *
 * Pure transformation function: throws simple Error on invalid date (not domain error).
 * Error handling is done at repository level.
 *
 * @param value - Date object or date string
 * @returns Date object
 * @throws ProgrammingError if value cannot be converted to a valid date
 */
export const toDate = (value: unknown): Date => {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throwProgrammingError(`Invalid date value: ${String(value)}`);
  }
  return date;
};

/**
 * Type guard to check if a value is a record (object with string keys).
 * @param value - Value to check
 * @returns true if value is a record
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && isObject(value) && !isArray(value);
};
