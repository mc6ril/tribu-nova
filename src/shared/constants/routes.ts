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
 * Project routes follow the pattern: /{projectId}/{view}
 * where projectId is a UUID and view can be: board, recipes, settings, etc.
 */
export const PROJECT_VIEWS = Object.freeze({
  BOARD: "board",
  RECIPES: "recipes",
  SETTINGS: "settings",
});

export type ProjectView = (typeof PROJECT_VIEWS)[keyof typeof PROJECT_VIEWS];

/**
 * Auth page route paths.
 * Used for redirects after auth operations (e.g., password reset redirect).
 */
export const AUTH_PAGE_ROUTES = Object.freeze({
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
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
  AUTH_PAGE_ROUTES.VERIFY_EMAIL,
  AUTH_PAGE_ROUTES.RESET_PASSWORD,
  AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
  AUTH_PAGE_ROUTES.CALLBACK,
]);

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
