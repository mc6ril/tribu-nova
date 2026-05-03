import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODES } from "@/shared/errors/appErrorCodes";

import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";

let mockLoggerWarn: jest.Mock;

jest.mock("@/shared/observability", () => ({
  createLoggerFactory: () => ({
    forScope: () => ({
      warn: (...args: unknown[]) => mockLoggerWarn(...args),
    }),
  }),
}));

const captureThrown = (fn: () => void): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected function to throw");
};

beforeEach(() => {
  mockLoggerWarn = jest.fn();
});

describe("handleAuthError", () => {
  it("rethrows known auth AppError values unchanged", () => {
    const knownError = createAppError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, {
      debugMessage: "Invalid login credentials",
    });

    const thrown = captureThrown(() => handleAuthError(knownError));

    expect(thrown).toBe(knownError);
    expect(mockLoggerWarn).toHaveBeenCalledWith("Authentication error", {
      error: knownError,
      errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    });
  });

  it("maps unknown infrastructure errors before throwing", () => {
    const providerError = {
      message: "Auth provider exploded",
      status: 503,
    };

    const thrown = captureThrown(() => handleAuthError(providerError));

    expect(thrown).toMatchObject({
      code: AUTH_ERROR_CODES.AUTH_PROVIDER_SERVER_ERROR,
      debugMessage: providerError.message,
    });
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "Authentication error (mapped from infrastructure error)",
      expect.objectContaining({
        error: providerError,
        errorCode: AUTH_ERROR_CODES.AUTH_PROVIDER_SERVER_ERROR,
      })
    );
  });
});
