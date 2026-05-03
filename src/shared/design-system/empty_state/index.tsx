"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Title from "@/shared/design-system/title";

import styles from "./empty_state.module.scss";

type Props = {
  /** Empty state title text */
  title: string;
  /** Empty state message text (falls back to i18n default if not provided) */
  message?: string;
  /** Optional icon component to display */
  icon?: React.ReactNode;
  /** Additional CSS class name for the icon wrapper */
  iconClassName?: string;
  /** Optional action button or link */
  action?: React.ReactNode;
  /** Additional CSS class name for the action wrapper */
  actionClassName?: string;
  /** Custom ARIA label for accessibility (falls back to title) */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
  /** Additional CSS class name for the title */
  titleClassName?: string;
  /** Additional CSS class name for the message */
  messageClassName?: string;
};

/**
 * Reusable EmptyState component to display empty states for lists, tables, and content areas.
 * Includes full accessibility support with proper ARIA attributes and helpful messaging.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No tickets"
 *   message="Create your first ticket to get started"
 *   action={<Button label="Create Ticket" onClick={handleCreate} />}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No results"
 *   message="Try adjusting your search filters"
 *   icon={<SearchIcon />}
 * />
 * ```
 */
const EmptyState = ({
  title,
  message,
  icon,
  iconClassName,
  action,
  actionClassName,
  ariaLabel,
  className,
  titleClassName,
  messageClassName,
}: Props) => {
  const t = useTranslations("common.emptyState");
  const displayMessage = message || t("defaultMessage");
  const displayAriaLabel = ariaLabel || title;
  const emptyStateId = getAccessibilityId("empty-state");
  const titleId = getAccessibilityId("empty-state-title");
  const messageId = getAccessibilityId("empty-state-message");

  const describedBy =
    [titleId, messageId].filter(Boolean).join(" ") || undefined;

  const emptyStateClasses = [styles["empty-state"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={emptyStateId}
      className={emptyStateClasses}
      role="status"
      aria-live="polite"
      aria-label={displayAriaLabel}
      aria-describedby={describedBy}
    >
      {icon && (
        <div
          className={[styles["empty-state__icon"], iconClassName]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <Title
        variant="h2"
        id={titleId}
        className={[styles["empty-state__title"], titleClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </Title>
      {displayMessage && (
        <p
          id={messageId}
          className={[styles["empty-state__message"], messageClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {displayMessage}
        </p>
      )}
      {action && (
        <div
          className={[styles["empty-state__action"], actionClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {action}
        </div>
      )}
    </div>
  );
};

export default React.memo(EmptyState);
