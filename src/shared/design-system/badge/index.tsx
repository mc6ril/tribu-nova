import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./badge.module.scss";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "small" | "medium" | "large";

type Props = {
  /** Badge label text */
  label: string;
  /** Badge variant style */
  variant?: BadgeVariant | string;
  /** Badge size */
  size?: BadgeSize;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
};

/**
 * Reusable Badge component for displaying status, priority, and categorical labels.
 * Supports multiple variants and sizes with full accessibility support.
 *
 * @example
 * ```tsx
 * <Badge label="Active" variant="success" />
 * ```
 *
 * @example
 * ```tsx
 * <Badge label="High Priority" variant="error" size="large" />
 * ```
 */
const Badge = ({
  label,
  variant = "default",
  size = "medium",
  ariaLabel,
  className,
}: Props) => {
  const badgeId = getAccessibilityId(`badge-${label}`);
  const variantClass = [
    "default",
    "success",
    "warning",
    "error",
    "info",
  ].includes(variant)
    ? variant
    : "default";

  const badgeClasses = [
    styles.badge,
    styles[`badge--${variantClass}`],
    styles[`badge--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      id={badgeId}
      className={badgeClasses}
      role="status"
      aria-label={ariaLabel || label}
    >
      {label}
    </span>
  );
};

export default React.memo(Badge);
