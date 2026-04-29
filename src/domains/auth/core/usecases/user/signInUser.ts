import { z } from "zod";

import type {
  AuthResult,
  SignInInput,
} from "@/domains/auth/core/domain/auth.types";
import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
  password: z.string().min(1, "Password is required"),
});

/**
 * Sign in an existing user.
 * Validates input and authenticates the user.
 *
 * @param repository - Auth repository
 * @param input - Signin credentials (email, password)
 * @returns Authentication result with session
 * @throws InvalidCredentialsError if credentials are invalid
 * @throws AuthenticationFailure for other authentication errors
 */
export const signInUser = async (
  gateway: AuthGateway,
  input: SignInInput
): Promise<AuthResult> => {
  const validatedInput = SignInSchema.parse(input);
  return gateway.signIn(validatedInput);
};
