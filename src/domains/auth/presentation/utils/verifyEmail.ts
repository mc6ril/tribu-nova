import type {
  VerifyEmailInput,
  VerifyEmailLinkType,
} from "@/domains/auth/core/domain/auth.types";

export type VerifyEmailRedirectError = {
  code: string | null;
  description: string | null;
};

export type ParsedVerifyEmailParams = {
  input: VerifyEmailInput | null;
  redirectError: VerifyEmailRedirectError | null;
  isMissingToken: boolean;
  shouldRecoverSession: boolean;
};

const ALLOWED_VERIFY_EMAIL_TYPES = new Set<VerifyEmailLinkType>([
  "email",
  "signup",
]);

const normalizeVerifyEmailType = (
  value: string | null
): VerifyEmailLinkType | undefined => {
  if (!value || !ALLOWED_VERIFY_EMAIL_TYPES.has(value as VerifyEmailLinkType)) {
    return undefined;
  }

  return value as VerifyEmailLinkType;
};

const parseHashParams = (hash?: string): URLSearchParams => {
  if (!hash) {
    return new URLSearchParams();
  }

  return new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
};

const readRedirectError = (
  searchParams: URLSearchParams,
  hash?: string
): VerifyEmailRedirectError | null => {
  const hashParams = parseHashParams(hash);
  const code =
    searchParams.get("error_code") ??
    hashParams.get("error_code") ??
    searchParams.get("error") ??
    hashParams.get("error");
  const description =
    searchParams.get("error_description") ??
    hashParams.get("error_description");

  if (!code && !description) {
    return null;
  }

  return {
    code,
    description,
  };
};

export const parseVerifyEmailParams = (
  searchParams: URLSearchParams,
  hash?: string
): ParsedVerifyEmailParams => {
  const redirectError = readRedirectError(searchParams, hash);
  const verified = searchParams.get("verified") === "1";

  if (redirectError) {
    return {
      input: null,
      redirectError,
      isMissingToken: false,
      shouldRecoverSession: false,
    };
  }

  if (verified) {
    return {
      input: null,
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: true,
    };
  }

  const type = normalizeVerifyEmailType(searchParams.get("type"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (code) {
    return {
      input: {
        code,
        type,
      },
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: false,
    };
  }

  if (tokenHash) {
    return {
      input: {
        tokenHash,
        type,
      },
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: false,
    };
  }

  if (token) {
    return {
      input: {
        email: email ?? undefined,
        token,
        type,
      },
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: false,
    };
  }

  return {
    input: null,
    redirectError: null,
    isMissingToken: true,
    shouldRecoverSession: false,
  };
};

export const getVerifyEmailRedirectErrorCode = (
  redirectError: VerifyEmailRedirectError | null
): "INVALID_TOKEN" | "EMAIL_VERIFICATION_ERROR" | null => {
  if (!redirectError) {
    return null;
  }

  const code = redirectError.code?.toLowerCase() ?? "";
  const description = redirectError.description?.toLowerCase() ?? "";

  if (
    code.includes("expired") ||
    code.includes("otp") ||
    description.includes("expired") ||
    description.includes("invalid") ||
    description.includes("otp")
  ) {
    return "INVALID_TOKEN";
  }

  return "EMAIL_VERIFICATION_ERROR";
};
