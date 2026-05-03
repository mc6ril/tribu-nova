import { z } from "zod";

import type { LoggerFactory } from "@/shared/observability";

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
  input: SignInInput,
  loggerFactory?: LoggerFactory
): Promise<AuthResult> => {
  const logger = loggerFactory?.forScope("auth.signin.usecase");
  logger?.info("signInUser entry", {
    function: "signInUser",
    email: input.email,
  });

  const validatedInput = SignInSchema.parse(input);
  logger?.info("signInUser validated input", {
    function: "signInUser",
    email: validatedInput.email,
  });

  const result = await gateway.signIn(validatedInput);
  logger?.info("signInUser gateway resolved", {
    function: "signInUser",
    email: validatedInput.email,
    hasSession: Boolean(result.session),
    sessionEmail: result.session?.user.email,
  });

  return result;
};
