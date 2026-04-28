"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslations } from "@/shared/i18n";

import styles from "./loader.module.scss";

/**
 * Loader size variants.
 * - small: Small spinner for inline use
 * - medium: Default size for most use cases
 * - large: Large spinner for full-page loading
 */
type LoaderSize = "small" | "medium" | "large";

/**
 * Loader display variants.
 * - full-page: Full-screen overlay for page-level loading
 * - inline: Inline loader for component-level loading
 */
type LoaderVariant = "full-page" | "inline";

type Props = {
  /** Size variant of the loader */
  size?: LoaderSize;
  /** Display variant of the loader */
  variant?: LoaderVariant;
  /** Custom ARIA label for accessibility (falls back to i18n default) */
  ariaLabel?: string;
  /** Custom loading message (falls back to i18n default) */
  message?: string;
  /** Additional CSS class name */
  className?: string;
};

/**
 * Reusable Loader component to display loading states throughout the application.
 * Includes full accessibility support with proper ARIA attributes and screen reader announcements.
 *
 * @example
 * ```tsx
 * <Loader variant="inline" size="medium" />
 * ```
 *
 * @example
 * ```tsx
 * <Loader
 *   variant="full-page"
 *   size="large"
 *   message="Loading data..."
 *   ariaLabel="Loading application data"
 * />
 * ```
 */
const Loader = ({
  size = "medium",
  variant = "full-page",
  ariaLabel,
  message,
  className,
}: Props) => {
  const t = useTranslations("common");
  const displayMessage = message || t("loading");
  const displayAriaLabel = ariaLabel || t("loadingAriaLabel");
  const loaderId = getAccessibilityId("loader");

  const loaderClasses = [
    styles.loader,
    styles[`loader--${size}`],
    styles[`loader--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={loaderId}
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-label={displayAriaLabel}
      aria-busy="true"
    >
      <div className={styles["loader__spinner"]} aria-hidden="true" />
      <p className={styles["loader__message"]}>{displayMessage}</p>
    </div>
  );
};

export default React.memo(Loader);
