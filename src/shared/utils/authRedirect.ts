import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";

export const VERIFIED_EMAIL_REDIRECT_PATH = `${AUTH_PAGE_ROUTES.VERIFY_EMAIL}?verified=1`;

export const sanitizeInternalRedirectPath = (
  candidate: string | null | undefined,
  fallback: string = PAGE_ROUTES.HOME
): string => {
  if (
    candidate &&
    candidate.startsWith(PAGE_ROUTES.HOME) &&
    !candidate.startsWith("//")
  ) {
    return candidate;
  }

  return fallback;
};

type BuildAuthCallbackPathOptions = {
  code?: string | null;
  nextPath?: string | null;
  fallbackPath?: string;
};

export const buildAuthCallbackPath = ({
  code,
  nextPath,
  fallbackPath = PAGE_ROUTES.HOME,
}: BuildAuthCallbackPathOptions = {}): string => {
  const params = new URLSearchParams();

  params.set("next", sanitizeInternalRedirectPath(nextPath, fallbackPath));

  if (code) {
    params.set("code", code);
  }

  return `${AUTH_PAGE_ROUTES.CALLBACK}?${params.toString()}`;
};

export const getAuthCodeRedirectTarget = (
  type: string | null | undefined
): string => {
  if (type === "recovery") {
    return AUTH_PAGE_ROUTES.UPDATE_PASSWORD;
  }

  return VERIFIED_EMAIL_REDIRECT_PATH;
};
