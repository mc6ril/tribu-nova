"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { Link } from "@/shared/i18n/routing";

import styles from "./navigation_item.module.scss";

type Props = {
  /** Navigation URL */
  href: string;
  /** Navigation label (translation key or plain text) */
  label: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Whether this is the active/current route */
  active?: boolean;
  /** Click handler (optional, for custom navigation logic) */
  onClick?: () => void;
  /** Hover prefetch hook */
  onMouseEnter?: () => void;
  /** Focus prefetch hook */
  onFocus?: () => void;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
  /** When true the item is rendered as non-navigable with a dimmed style */
  locked?: boolean;
  /** Short label shown next to the item when locked (e.g. "Pro") */
  planBadge?: string;
};

/**
 * Reusable NavigationItem component for menu navigation items.
 * Uses Link component for navigation with active state support.
 * Includes full accessibility support with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <NavigationItem href="/dashboard" label="common.dashboard" active />
 * ```
 *
 * @example
 * ```tsx
 * <NavigationItem
 *   href="/settings"
 *   label="Settings"
 *   icon={<SettingsIcon />}
 *   onClick={handleNavigation}
 * />
 * ```
 */
const NavigationItem = ({
  href,
  label,
  icon,
  active = false,
  onClick,
  onMouseEnter,
  onFocus,
  ariaLabel,
  className,
  locked = false,
  planBadge,
}: Props) => {
  const navItemId = getAccessibilityId(`nav-item-${href}`);
  const t = useTranslations("common");
  const displayLabel = label.startsWith("common.")
    ? t(label.replace("common.", ""))
    : label;
  const displayAriaLabel = ariaLabel || displayLabel;

  const navItemClasses = [
    styles["navigation-item"],
    active && styles["navigation-item--active"],
    locked && styles["navigation-item--locked"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (locked) {
    return (
      <li id={navItemId} className={navItemClasses} role="none">
        <span
          className={styles["navigation-item__link"]}
          data-sidebar-dismiss="true"
          aria-disabled="true"
          aria-label={displayAriaLabel}
          role="link"
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick?.();
            }
          }}
          tabIndex={0}
        >
          {icon && (
            <span
              className={styles["navigation-item__icon"]}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <span className={styles["navigation-item__label"]}>
            {displayLabel}
          </span>
          {planBadge && (
            <span
              className={styles["navigation-item__plan-badge"]}
              aria-hidden="true"
            >
              {planBadge}
            </span>
          )}
        </span>
      </li>
    );
  }

  const linkProps = active
    ? {
        "aria-current": "page" as const,
      }
    : {};

  return (
    <li id={navItemId} className={navItemClasses} role="none">
      <Link
        href={href}
        className={styles["navigation-item__link"]}
        data-sidebar-dismiss="true"
        aria-label={displayAriaLabel}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        {...linkProps}
      >
        {icon && (
          <span className={styles["navigation-item__icon"]} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles["navigation-item__label"]}>{displayLabel}</span>
      </Link>
    </li>
  );
};

export default React.memo(NavigationItem);
