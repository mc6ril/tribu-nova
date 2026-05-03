import { z } from "zod";

import type {
  AuthResult,
  UpdatePasswordInput,
} from "@/domains/auth/core/domain/auth.types";
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

export const UpdatePasswordSchema = z.object({
  password: PasswordSchema,
});

/**
 * Update password after a password reset (PKCE flow — session established by auth callback).
 *
 * @param repository - Auth repository
 * @param input - Password update input
 * @returns Authentication result with session (user is auto-logged in after password update)
 * @throws InvalidTokenError if token/session is invalid or expired
 * @throws PasswordResetError for other password reset errors
 * @throws AuthenticationFailure for other authentication errors
 */
export const updatePassword = async (
  gateway: AuthGateway,
  input: UpdatePasswordInput
): Promise<AuthResult> => {
  const validatedInput = UpdatePasswordSchema.parse(input);
  return gateway.updatePassword(validatedInput);
};
