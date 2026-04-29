import { z } from "zod";

import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

export const ResendVerificationEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

/**
 * Resend verification email to a user.
 * Validates input and resends verification email.
 *
 * @param repository - Auth repository
 * @param email - Email address to resend verification to
 * @throws ZodError if email validation fails
 * @throws EmailVerificationError if resend fails
 * @throws AuthenticationFailure for other authentication errors
 */
export const resendVerificationEmail = async (
  gateway: AuthGateway,
  email: string
): Promise<void> => {
  const validatedInput = ResendVerificationEmailSchema.parse({ email });
  return gateway.resendVerificationEmail(validatedInput.email);
};
