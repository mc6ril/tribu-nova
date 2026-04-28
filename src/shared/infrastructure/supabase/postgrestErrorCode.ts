import { isNonEmptyString, isRecord } from "@/shared/utils";

/**
 * Reads PostgREST / Supabase client `error.code` (e.g. PGRST116) from a thrown value.
 */
export const getPostgrestErrorCode = (error: unknown): string | undefined => {
  if (!error || !isRecord(error)) {
    return undefined;
  }
  const record = error;
  return isNonEmptyString(record.code) ? record.code : undefined;
};
