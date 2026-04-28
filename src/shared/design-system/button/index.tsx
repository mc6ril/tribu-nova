import React, { type ReactNode, useCallback } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { isEnterKey, isSpaceKey } from "@/shared/a11y/utilities";

import styles from "./button.module.scss";

/**
 * Button variant types.
 * - primary: Emphasizes primary actions (default)
 * - secondary: For secondary actions
 * - danger: For destructive actions
 * - ghost: Minimal style with no background or border
 * - publish: Ticket detail "publish" action style
 * - save: Ticket detail "save" action style
 * - saveDanger: Destructive primary action with save shape
 * - edit: Ticket comment "edit" action style
 * - delete: Ticket comment "delete" action style
 */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "publish"
  | "save"
  | "saveDanger"
  | "edit"
  | "delete";

type Props = {
  /** Button label text (visible when `children` is not set; always used for accessible naming fallback) */
  label: string;
  /** Click handler function */
  onClick?: () => void;
  /** Button variant style */
  variant?: ButtonVariant;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
  /** Optional content (e.g. icon); when set, replaces visible `label` text */
  children?: ReactNode;
  /** Additional CSS module classes (merged after variant classes) */
  className?: string;
  /** Optional `title` attribute (tooltip) */
  title?: string;
  /** Optional ARIA relationship for controlled regions (e.g. disclosure) */
  "aria-controls"?: string;
  /** Optional expanded state for disclosure-like controls */
  "aria-expanded"?: boolean;
  /** Optional pressed state for toggle-like controls */
  "aria-pressed"?: boolean;
};

/**
 * Reusable Button component with variants and full accessibility support.
 * Supports keyboard navigation (Enter and Space keys) and proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Button
 *   label="Submit"
 *   onClick={handleSubmit}
 *   variant="primary"
 *   type="submit"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Button
 *   label="Delete"
 *   onClick={handleDelete}
 *   variant="danger"
 *   aria-label="Delete item"
 * />
 * ```
 */
const Button = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  type = "button",
  "aria-label": ariaLabel,
  children,
  className,
  title,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  "aria-pressed": ariaPressed,
}: Props) => {
  const buttonId = getAccessibilityId(`button-${label}`);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (disabled) {
        return;
      }

      if (isEnterKey(event.nativeEvent) || isSpaceKey(event.nativeEvent)) {
        // For submit buttons, don't prevent default on Enter or Space keys
        // to allow native form submission behavior
        if (type === "submit") {
          // Let the form handle submission naturally
          return;
        }

        event.preventDefault();
        if (onClick) {
          onClick();
        }
      }
    },
    [disabled, onClick, type]
  );

  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    fullWidth && styles["button--full-width"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      id={buttonId}
      type={type}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={buttonClasses}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      title={title}
      role="button"
    >
      {children ?? label}
    </button>
  );
};

export default React.memo(Button);
