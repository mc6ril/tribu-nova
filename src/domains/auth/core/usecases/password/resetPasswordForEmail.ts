import { z } from "zod";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/auth.types";
import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
});

/**
 * Request a password reset email.
 * Validates input and sends password reset email to the user.
 *
 * @param repository - Auth repository
 * @param input - Password reset request (email)
 * @throws PasswordResetError if email not found or reset fails
 * @throws AuthenticationFailure for other authentication errors
 */
export const resetPasswordForEmail = async (
  gateway: AuthGateway,
  input: ResetPasswordInput
): Promise<void> => {
  const validatedInput = ResetPasswordSchema.parse(input);
  return gateway.resetPasswordForEmail(validatedInput);
};
