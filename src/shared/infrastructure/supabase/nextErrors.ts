/**
 * Detects Next.js dynamic server usage errors that must be re-thrown.
 * These errors are framework control flow signals, not application failures.
 */
export const isDynamicServerUsageError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest === "DYNAMIC_SERVER_USAGE"
  ) {
    return true;
  }

  // Backward-compatible fallback in case older runtime variants omit digest.
  return (
    error instanceof Error && error.message.includes("Dynamic server usage")
  );
};
