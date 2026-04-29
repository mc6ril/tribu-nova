import { z } from "zod";

import type {
  AuthResult,
  VerifyEmailInput,
  VerifyEmailLinkType,
} from "@/domains/auth/core/domain/auth.types";
import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

export const VerifyEmailLinkTypeSchema = z.enum(["email", "signup"]);

export const VerifyEmailSchema = z
  .object({
    email: z
      .union([
        z.string().email({ message: "Invalid email format" }),
        z.literal(""),
      ])
      .optional(),
    token: z.string().min(1, "Token is required").optional(),
    tokenHash: z.string().min(1, "Token hash is required").optional(),
    code: z.string().min(1, "Code is required").optional(),
    type: VerifyEmailLinkTypeSchema.optional(),
  })
  .refine((input) => Boolean(input.token || input.tokenHash || input.code), {
    message: "A verification token, token hash, or code is required",
    path: ["token"],
  });

/**
 * Verify email address using a verification token.
 * Validates input and verifies the email link payload.
 *
 * @param repository - Auth repository
 * @param input - Email verification input
 * @returns Authentication result with session (user is auto-logged in after verification)
 * @throws InvalidTokenError if token is invalid or expired
 * @throws EmailVerificationError for other verification errors
 * @throws AuthenticationFailure for other authentication errors
 */
export const verifyEmail = async (
  gateway: AuthGateway,
  input: VerifyEmailInput
): Promise<AuthResult> => {
  const validatedInput = VerifyEmailSchema.parse(input) as VerifyEmailInput & {
    type?: VerifyEmailLinkType;
  };
  return gateway.verifyEmail(validatedInput);
};
