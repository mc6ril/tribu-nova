// Re-export route constants for convenience
export type { ProjectView } from "./routes";
export {
  API_ROUTES,
  AUTH_PAGE_ROUTES,
  PAGE_ROUTES,
  PROJECT_VIEWS,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
} from "./routes";

// Re-export error code constants (canonical definitions in shared/errors)
export type {
  AuthErrorCode,
  RepositoryErrorCode,
} from "@/shared/errors/appErrorCodes";
export {
  AUTH_ERROR_CODES,
  REPOSITORY_ERROR_CODES,
} from "@/shared/errors/appErrorCodes";

// Re-export app-level constants
export { APP_LIMITS, STORAGE_KEYS } from "./app";

// Re-export types derived from app-level constants
export type { PaginationLimits, StorageKey } from "./app.types";

// Re-export legal page constants
export type { LegalSection } from "./legal";
export { GDPR_RIGHTS_KEYS, LEGAL_SECTIONS } from "./legal";

// Re-export landing page constants
export {
  FEATURE_KEYS,
  HERO_PROOF_KEYS,
  IMPACT_KEYS,
  PREVIEW_COLUMNS,
  PREVIEW_ITEM_KEYS,
  RHYTHM_KEYS,
  TRUST_ITEM_KEYS,
  VALUE_KEYS,
} from "./landing";

// Re-export API message constants
export {
  API_MESSAGES_AUTH,
  API_MESSAGES_COMMON,
  API_MESSAGES_STRIPE,
} from "./apiMessages";

// Re-export project constants
export {
  PROJECT_BOARD_EMOJI_PRESETS,
  stripProjectBoardEmojiPrefix,
} from "./projectBoardEmoji";
