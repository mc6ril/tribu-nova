"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { Link as IntlLink } from "@/shared/i18n/routing";

import styles from "./link.module.scss";

type LinkVariant = "default" | "primary" | "secondary";

type Props = {
  /** Link URL */
  href: string;
  /** Link content */
  children: React.ReactNode;
  /** Link variant style */
  variant?: LinkVariant;
  /** Whether the link should opt out of default design-system styling */
  unstyled?: boolean;
  /** Whether this is an external link */
  external?: boolean;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
} & React.ComponentPropsWithoutRef<typeof IntlLink>;

/**
 * Reusable Link component that wraps Next.js Link for consistent navigation styling.
 * Supports internal navigation (client-side routing) and external links with proper security attributes.
 * Includes full accessibility support.
 *
 * @example
 * ```tsx
 * <Link href="/dashboard">Go to Dashboard</Link>
 * ```
 *
 * @example
 * ```tsx
 * <Link href="https://example.com" external variant="primary">
 *   External Link
 * </Link>
 * ```
 */
const LinkComponent = ({
  href,
  children,
  variant = "default",
  unstyled = false,
  external = false,
  ariaLabel,
  className,
  onClick,
  target,
  ...linkProps
}: Props) => {
  const linkId = getAccessibilityId(`link-${href}`);

  const linkClasses = [
    !unstyled ? styles.link : undefined,
    !unstyled ? styles[`link--${variant}`] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": ariaLabel
          ? `${ariaLabel} (Opens in new tab)`
          : `${children} (Opens in new tab)`,
      }
    : {
        "aria-label": ariaLabel,
      };

  // For external links, use regular <a> tag instead of Next.js Link
  if (external) {
    return (
      <a
        id={linkId}
        href={href}
        className={linkClasses}
        onClick={onClick}
        {...externalProps}
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  return (
    <IntlLink
      id={linkId}
      href={href}
      className={linkClasses}
      target={target}
      onClick={onClick}
      {...externalProps}
      {...linkProps}
    >
      {children}
    </IntlLink>
  );
};

export default React.memo(LinkComponent);
