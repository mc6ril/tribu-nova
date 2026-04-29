import { z } from "zod";

import { DOMAIN_RULE_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { createDomainRuleError } from "@/shared/errors/domainRuleError";

import type { UpdateCredentialsInput } from "@/domains/auth/core/domain/auth.types";
import { PASSWORD_LIMITS } from "@/domains/auth/core/domain/password.policy";
import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

const PasswordSchema = z
  .string()
  .min(
    PASSWORD_LIMITS.MIN_LENGTH,
    `Password must be at least ${PASSWORD_LIMITS.MIN_LENGTH} characters`
  )
  .max(
    PASSWORD_LIMITS.MAX_LENGTH,
    `Password must be less than ${PASSWORD_LIMITS.MAX_LENGTH} characters`
  );

export const UpdateCredentialsSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: PasswordSchema.optional(),
});

/**
 * Update auth credentials (email and/or password).
 * Profile data (display name, avatar, preferences) is managed via the profile domain.
 *
 * @param repository - Auth repository
 * @param input - Auth credential update (email and/or password)
 * @throws AuthenticationFailure if update fails
 */
export const updateCredentials = async (
  gateway: AuthGateway,
  input: UpdateCredentialsInput
): Promise<void> => {
  const validatedInput = UpdateCredentialsSchema.parse(input);

  if (!validatedInput.email && !validatedInput.password) {
    throw createDomainRuleError(
      DOMAIN_RULE_ERROR_CODE.UPDATE_CREDENTIALS_NO_FIELDS,
      "At least one field (email or password) must be provided"
    );
  }

  return gateway.updateCredentials(validatedInput);
};
