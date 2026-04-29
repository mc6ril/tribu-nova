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
  token: z.string().min(1, "Token is required").optional(),
  email: z
    .union([
      z.string().email({ message: "Invalid email format" }),
      z.literal(""),
    ])
    .optional(),
});

/**
 * Update password after a password reset.
 * Supports two flows:
 * - PKCE flow: session already established by auth callback, only password needed.
 * - Legacy token flow: email + token provided for OTP verification.
 *
 * @param repository - Auth repository
 * @param input - Password update input (password required; token and email optional)
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
