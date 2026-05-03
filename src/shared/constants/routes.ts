/**
 * Route constants for the application.
 * Used for route matching, redirects, and navigation logic.
 */

/**
 * Named page routes reused across redirects and navigation.
 */
export const PAGE_ROUTES = Object.freeze({
  /** Site root; serves the default-locale public home. */
  HOME: "/",
  PRICING: "/pricing",
  LEGAL: "/legal",
  WORKSPACE: "/workspace",
  ACCOUNT: "/account",
  RUNTIME_CONFIG_LAB: "/runtime-config-lab",
});

/**
 * Protected routes that require authentication.
 * These routes are protected by middleware and require a valid session.
 * Includes /workspace, /account, and all project-specific routes (/{projectId}/...)
 */
export const PROTECTED_ROUTES: readonly string[] = Object.freeze([
  PAGE_ROUTES.WORKSPACE,
  PAGE_ROUTES.ACCOUNT,
  PAGE_ROUTES.RUNTIME_CONFIG_LAB,
]);

/**
 * Project route patterns.
 * Project routes follow the pattern: /workspace/{projectId}/{view}
 * where projectId can be a UUID or human-friendly slug.
 */
export const PROJECT_VIEWS = Object.freeze({
  BOARD: "board",
  RECIPES: "recipes",
  SETTINGS: "projectSettings",
});

export type ProjectView = (typeof PROJECT_VIEWS)[keyof typeof PROJECT_VIEWS];

/**
 * Auth page route paths.
 * Used for redirects after auth operations (e.g., password reset redirect).
 */
export const AUTH_PAGE_ROUTES = Object.freeze({
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  JOIN: "/auth/join",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET_PASSWORD: "/auth/reset-password",
  CALLBACK: "/auth/callback",
  UPDATE_PASSWORD: "/auth/update-password",
});

/**
 * Public routes that don't require authentication.
 * These routes are accessible without a session.
 */
export const PUBLIC_ROUTES: readonly string[] = Object.freeze([
  PAGE_ROUTES.HOME,
  PAGE_ROUTES.PRICING,
  PAGE_ROUTES.LEGAL,
  AUTH_PAGE_ROUTES.SIGNIN,
  AUTH_PAGE_ROUTES.SIGNUP,
  AUTH_PAGE_ROUTES.JOIN,
  AUTH_PAGE_ROUTES.VERIFY_EMAIL,
  AUTH_PAGE_ROUTES.RESET_PASSWORD,
  AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
  AUTH_PAGE_ROUTES.CALLBACK,
]);

/**
 * Public routes that should remain visible to authenticated users.
 * `/legals` is accepted as a defensive alias for the legal page wording used in
 * product discussions; the concrete route today is `/legal`.
 */
export const AUTHENTICATED_PUBLIC_REDIRECT_EXEMPT_ROUTES: readonly string[] =
  Object.freeze([PAGE_ROUTES.HOME, PAGE_ROUTES.LEGAL, "/legals"]);

/**
 * Public page routes that are guest-only. Authenticated visitors are sent back
 * to the workspace from Proxy before React starts rendering.
 */
export const AUTHENTICATED_PUBLIC_REDIRECT_ROUTES: readonly string[] =
  Object.freeze(
    PUBLIC_ROUTES.filter(
      (route) =>
        route !== AUTH_PAGE_ROUTES.CALLBACK &&
        !AUTHENTICATED_PUBLIC_REDIRECT_EXEMPT_ROUTES.includes(route)
    )
  );

/**
 * API route paths for server-side operations.
 * Used by client-side hooks to call API routes for admin-privileged operations.
 */
export const API_ROUTES = Object.freeze({
  STRIPE: Object.freeze({
    CHECKOUT: "/api/stripe/checkout",
    PORTAL: "/api/stripe/portal",
    WEBHOOK: "/api/stripe/webhook",
  }),
  AUTH: Object.freeze({
    DELETE_USER: "/api/auth/delete-user",
  }),
});
