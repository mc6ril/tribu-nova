import { z } from "zod";

import type {
  AuthResult,
  SignUpInput,
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

export const SignUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
  password: PasswordSchema,
  confirmPassword: z.string().min(1, "Password confirmation is required"),
  displayName: z
    .string()
    .trim()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  locale: z.enum(["fr", "en", "es"]),
  acceptedTermsAt: z.string().optional(),
});

/**
 * Sign up a new user.
 * Validates input and creates a new user account.
 *
 * @param repository - Auth repository
 * @param input - Signup credentials (email, password)
 * @returns Authentication result with session (or null session with requiresEmailVerification flag if email verification is required)
 * @throws AuthenticationFailure if signup fails (email already exists, weak password, etc.)
 */
export const signUpUser = async (
  gateway: AuthGateway,
  input: SignUpInput
): Promise<AuthResult> => {
  const validatedInput = SignUpSchema.parse(input);
  return gateway.signUp(validatedInput);
};
