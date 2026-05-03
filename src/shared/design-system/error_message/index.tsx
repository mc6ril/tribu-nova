"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { ErrorIcon } from "@/shared/design-system/icons";
import Title from "@/shared/design-system/title";

import styles from "./error_message.module.scss";

type Props = {
  /** Error message text to display */
  message: string;
  /** Optional error title */
  title?: string;
  /** Optional dismiss handler - when provided, shows dismiss button */
  onDismiss?: () => void;
  /** Custom ARIA label for accessibility (falls back to message) */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
};

/**
 * Reusable ErrorMessage component to display error messages throughout the application.
 * Includes full accessibility support with proper ARIA attributes and screen reader announcements.
 *
 * @example
 * ```tsx
 * <ErrorMessage message="An error occurred" />
 * ```
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="Connection Error"
 *   message="Unable to connect to the server"
 *   onDismiss={() => setError(null)}
 *   ariaLabel="Connection error occurred"
 * />
 * ```
 */
const ErrorMessage = ({
  message,
  title,
  onDismiss,
  ariaLabel,
  className,
}: Props) => {
  const tCommon = useTranslations("common");
  const displayAriaLabel = ariaLabel || message;
  const errorId = getAccessibilityId("error-message");
  const titleId = title ? getAccessibilityId("error-message-title") : undefined;
  const messageId = getAccessibilityId("error-message-text");

  const describedBy =
    [titleId, messageId].filter(Boolean).join(" ") || undefined;

  const errorClasses = [styles["error-message"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={errorId}
      className={errorClasses}
      role="alert"
      aria-live="assertive"
      aria-label={displayAriaLabel}
      aria-describedby={describedBy}
    >
      <div className={styles["error-message__content"]}>
        <div className={styles["error-message__header"]}>
          <ErrorIcon className={styles["error-message__icon"]} />
          {title && (
            <Title
              variant="h3"
              id={titleId}
              className={styles["error-message__title"]}
            >
              {title}
            </Title>
          )}
          {onDismiss && (
            <div className={styles["error-message__dismiss"]}>
              <button
                type="button"
                onClick={onDismiss}
                className={styles["error-message__dismiss-button"]}
                aria-label={tCommon("dismissAriaLabel") || "Dismiss error"}
              >
                {tCommon("dismiss") || "Dismiss"}
              </button>
            </div>
          )}
        </div>
        <p id={messageId} className={styles["error-message__text"]}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default React.memo(ErrorMessage);
