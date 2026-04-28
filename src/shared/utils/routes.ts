import {
  PAGE_ROUTES,
  PROJECT_VIEWS,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
} from "@/shared/constants/routes";
import { supportedLocales } from "@/shared/i18n/config";

const PUBLIC_LOCALE_PREFIX = supportedLocales.join("|");
const PUBLIC_LEAF_ROUTES = [PAGE_ROUTES.PRICING, PAGE_ROUTES.LEGAL]
  .map((value) => value.replace(/^\//, ""))
  .join("|");
const PUBLIC_ENTRY_PATH = new RegExp(
  `^(?:${PAGE_ROUTES.HOME}$|${PAGE_ROUTES.PRICING}/?$|${PAGE_ROUTES.LEGAL}(?:/.*)?$|/(${PUBLIC_LOCALE_PREFIX})(?:$|/(?:${PUBLIC_LEAF_ROUTES})/?$|/${PAGE_ROUTES.LEGAL.replace(/^\//, "")}(?:/.*)?$))`,
  "i"
);

/**
 * Public entry URLs (default locale unprefixed, secondary locales prefixed).
 */
export const isPublicEntryRoute = (pathname: string): boolean => {
  return PUBLIC_ENTRY_PATH.test(normalizePath(pathname));
};

const UUID_PATH_SEGMENT =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const PROJECT_ROUTE_PATTERN = new RegExp(
  `^/${UUID_PATH_SEGMENT}(?:/([^/]+)(/.*)?)?$`,
  "i"
);

/**
 * Check if a pathname is a public route.
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a public route
 */
export const isPublicRoute = (pathname: string): boolean => {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  if (isPublicEntryRoute(pathname)) {
    return true;
  }

  return false;
};

/**
 * Check if a pathname is a protected route.
 * Protected routes include:
 * - Exact matches in PROTECTED_ROUTES (e.g., /workspace)
 * - Project routes following the pattern /{projectId}[/view[/...]]
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a protected route
 */
export const isProtectedRoute = (pathname: string): boolean => {
  // Check exact matches
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Project root (/{projectId}) and nested views are protected.
  return PROJECT_ROUTE_PATTERN.test(pathname);
};

/**
 * Check if a pathname is a project route.
 * Project routes follow the pattern: /{projectId}[/view[/...]]
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a project route
 */
export const isProjectRoute = (pathname: string): boolean => {
  return PROJECT_ROUTE_PATTERN.test(pathname);
};

/**
 * Extract project ID from a project route pathname.
 *
 * @param pathname - The pathname (e.g., "/abc-123-def/board")
 * @returns The project ID if found, null otherwise
 */
export const extractProjectId = (pathname: string): string | null => {
  const match = pathname.match(
    /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  return match ? match[1] : null;
};

/**
 * Extract view name from a project route pathname.
 *
 * @param pathname - The pathname (e.g., "/abc-123-def/board")
 * @returns The view name if found, null otherwise
 */
export const extractProjectView = (pathname: string): string | null => {
  const match = pathname.match(
    /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([^/]+)/i
  );
  return match ? match[1] : null;
};

/**
 * Build a project route pathname.
 *
 * @param projectId - The project UUID
 * @param view - The view name (board, settings, etc.)
 * @returns The route pathname
 */
export const buildProjectRoute = (projectId: string, view: string): string => {
  return `/${projectId}/${view}`;
};

/**
 * Build a ticket detail route pathname.
 *
 * @param projectId - The project UUID
 * @param ticketId - The ticket UUID
 * @returns The canonical ticket detail page pathname
 */
export const buildTicketDetailRoute = (
  projectId: string,
  ticketId: string
): string => {
  return `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}/tickets/${ticketId}`;
};

/**
 * Normalize a pathname or href by removing a trailing slash (except for root).
 *
 * @param path - The path to normalize
 * @returns Normalized path without trailing slash (except when path is "/")
 */
export const normalizePath = (path: string): string => {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
};

type IsActiveHrefOptions = {
  exactOnly?: boolean;
};

/**
 * Determine whether a navigation href is active for a given pathname.
 * - Exact match returns true
 * - When exactOnly is false, any sub-path (href as prefix) is considered active
 *
 * @param pathname - Current pathname (from router)
 * @param href - Target href of the navigation item
 * @param options - Options to control matching behavior
 * @returns True if the href should be considered active
 */
export const isActiveHref = (
  pathname: string,
  href: string,
  options?: IsActiveHrefOptions
): boolean => {
  const normalizedPathname = normalizePath(pathname);
  const normalizedHref = normalizePath(href);

  if (normalizedPathname === normalizedHref) {
    return true;
  }

  if (options?.exactOnly) {
    return false;
  }

  return normalizedPathname.startsWith(`${normalizedHref}/`);
};
