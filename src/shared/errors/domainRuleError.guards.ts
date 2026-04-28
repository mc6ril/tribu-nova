import { isAppError } from "@/shared/errors/appError";
import {
  DOMAIN_RULE_ERROR_CODES,
  type DomainRuleErrorCode,
} from "@/shared/errors/appErrorCodes";
import type { DomainRuleError } from "@/shared/errors/domainRuleError";

/**
 * Type guard for domain rule violations (stable codes from {@link DOMAIN_RULE_ERROR_CODES}).
 */
export const isDomainRuleError = (error: unknown): error is DomainRuleError => {
  if (!isAppError(error)) {
    return false;
  }
  return DOMAIN_RULE_ERROR_CODES.includes(error.code as DomainRuleErrorCode);
};
