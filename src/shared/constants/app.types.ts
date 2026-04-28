import { APP_LIMITS, STORAGE_KEYS } from "./app";

/**
 * Type definitions derived from application constants.
 *
 * All types are kept in this file to keep `app.ts` focused on values only.
 *
 * Note: Route-related types are defined in `routes.ts` alongside route constants.
 */

/**
 * Type for storage key identifiers (keys of STORAGE_KEYS object).
 */
export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Type for pagination limits shape.
 */
export type PaginationLimits = typeof APP_LIMITS.PAGINATION;
