/**
 * Errors thrown for programming mistakes or bootstrap misconfiguration.
 * These are not {@link AppError} — they are not mapped through i18n for end users.
 * Typical cases: React hook used outside provider, missing env at startup, invalid invariant.
 */
export class ProgrammingError extends Error {
  readonly _tag = "ProgrammingError" as const;

  constructor(message: string) {
    super(message);
    this.name = "ProgrammingError";
    Object.setPrototypeOf(this, ProgrammingError.prototype);
  }
}

export const isProgrammingError = (
  error: unknown
): error is ProgrammingError => {
  return error instanceof ProgrammingError;
};

export const throwProgrammingError = (message: string): never => {
  throw new ProgrammingError(message);
};

/**
 * Narrows a value after a failed null/undefined check. Use for React context and env vars.
 */
export const assertDefined = <T>(
  value: T | null | undefined,
  message: string
): asserts value is T => {
  if (value === null || value === undefined) {
    throwProgrammingError(message);
  }
};

/**
 * Returns a non-empty string or throws. Narrows `string | undefined` for env reads.
 */
export const requireNonEmptyEnv = (
  value: string | undefined,
  message: string
): string => {
  if (value === undefined || value === "") {
    throw new ProgrammingError(message);
  }
  return value;
};
