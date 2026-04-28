import type { AppError } from "@/shared/errors/appError";
import { normalizeToAppError } from "@/shared/errors/appError";
import { APP_ERROR_MESSAGE_KEY } from "@/shared/i18n/appErrorMessageKeys";

type ErrorTranslationValues = Record<string, string | number | Date>;
type ErrorTranslator = (key: string, params?: ErrorTranslationValues) => string;

const DOMAIN_CONSTRAINT_TO_I18N_KEY: Record<string, string> = {
  LAST_ADMIN_REQUIRED: "domain.LAST_ADMIN_REQUIRED",
  INVITATION_ALREADY_USED: "domain.INVITATION_ALREADY_USED",
  INVITATION_EXPIRED: "domain.INVITATION_EXPIRED",
  INVITATION_ALREADY_MEMBER: "domain.INVITATION_ALREADY_MEMBER",
};

/**
 * Maps a normalized {@link AppError} to a translated user-facing string.
 */
export const getErrorMessageFromAppError = (
  appError: AppError,
  tErrors: ErrorTranslator
): string => {
  if (
    appError.code === "CONSTRAINT_VIOLATION" &&
    appError.context?.constraint
  ) {
    const mappedKey =
      DOMAIN_CONSTRAINT_TO_I18N_KEY[appError.context.constraint];
    if (mappedKey) {
      return tErrors(mappedKey);
    }
  }

  if (
    appError.code === "NOT_FOUND" &&
    appError.context?.entityType &&
    appError.context?.entityId
  ) {
    return tErrors("repository.NOT_FOUND_WITH_ENTITY", {
      entityType: appError.context.entityType,
      entityId: appError.context.entityId,
    });
  }

  const translationKey = APP_ERROR_MESSAGE_KEY[appError.code];
  if (translationKey) {
    return tErrors(translationKey);
  }

  return tErrors("generic");
};

/**
 * Gets a user-facing error message from an error value.
 * Resolves stable {@link AppError} codes to translated strings via the `errors` namespace.
 *
 * @param error - Unknown error (typically from a mutation or query)
 * @param tErrors - Translation function for the `errors` namespace
 * @returns Translated error message
 */
export const getErrorMessage = (
  error: unknown,
  tErrors: ErrorTranslator
): string => {
  const appError = normalizeToAppError(error);

  if (!appError) {
    return tErrors("generic");
  }

  return getErrorMessageFromAppError(appError, tErrors);
};
