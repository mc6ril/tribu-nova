import type { InputHTMLAttributes } from "react";
import React, { useCallback, useEffect, useRef } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { isSpaceKey } from "@/shared/a11y/utilities";

import styles from "./checkbox.module.scss";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Checkbox label text */
  label: string;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Whether the checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
};

/**
 * Reusable Checkbox component with label support.
 * Includes full accessibility support with proper form labeling and ARIA attributes.
 * Supports indeterminate state for "some selected" scenarios.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="I agree to the terms"
 *   name="terms"
 *   checked={accepted}
 *   onChange={handleChange}
 *   required
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Select all"
 *   checked={allSelected}
 *   indeterminate={someSelected}
 *   onChange={handleSelectAll}
 * />
 * ```
 */
const Checkbox = ({
  label,
  checked = false,
  indeterminate = false,
  required = false,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  onChange,
  ...checkboxProps
}: Props) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const baseKey = `checkbox-${label}`;
  const checkboxId = id || getAccessibilityId(baseKey);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (disabled) {
        return;
      }

      if (isSpaceKey(event.nativeEvent)) {
        event.preventDefault();
        if (onChange) {
          const syntheticEvent = {
            ...event,
            target: checkboxRef.current,
            currentTarget: checkboxRef.current,
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    },
    [disabled, onChange]
  );

  const ariaChecked =
    indeterminate === true ? "mixed" : checked ? "true" : "false";

  const checkboxClasses = [
    styles.checkbox,
    disabled && styles["checkbox--disabled"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles["checkbox-wrapper"]}>
      <input
        ref={checkboxRef}
        type="checkbox"
        id={checkboxId}
        className={styles["checkbox-input"]}
        checked={checked}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel || label}
        aria-checked={ariaChecked}
        aria-required={required}
        aria-disabled={disabled}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        {...checkboxProps}
      />
      <label htmlFor={checkboxId} className={checkboxClasses}>
        <span className={styles["checkbox-icon"]}>
          {(checked || indeterminate) && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {indeterminate ? (
                <rect x="2" y="5" width="8" height="2" fill="currentColor" />
              ) : (
                <path
                  d="M10 2L4 8L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </svg>
          )}
        </span>
        <span className={styles["checkbox-label"]}>{label}</span>
      </label>
    </div>
  );
};

export default React.memo(Checkbox);
