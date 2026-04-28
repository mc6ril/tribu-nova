import type { TextareaHTMLAttributes } from "react";
import React, { forwardRef, useMemo } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./textarea.module.scss";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Textarea label text */
  label: string;
  /** Error message to display below textarea */
  error?: string;
  /** Helper text to display below textarea (shown when no error) */
  helperText?: string;
  /** Whether the textarea is required */
  required?: boolean;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Number of visible text lines */
  rows?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Whether textarea is resizable */
  resize?: "none" | "both" | "vertical" | "horizontal";
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
};

/**
 * Reusable Textarea component with label, error state, and helper text support.
 * Includes full accessibility support with proper form labeling, error association, and ARIA attributes.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   name="description"
 *   rows={4}
 *   required
 *   error={errors.description?.message}
 *   helperText="Enter a detailed description"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Comments"
 *   name="comments"
 *   maxLength={500}
 *   resize="vertical"
 * />
 * ```
 */
const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      rows = 4,
      maxLength,
      resize = "vertical",
      id,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      value,
      onChange,
      ...textareaProps
    },
    ref
  ) => {
    const baseKey = `textarea-${label}`;
    const textareaId = id || getAccessibilityId(baseKey);
    const errorId = error ? getAccessibilityId(`${baseKey}-error`) : undefined;
    const helperTextId = helperText
      ? getAccessibilityId(`${baseKey}-helper`)
      : undefined;
    const characterCountId = maxLength
      ? getAccessibilityId(`${baseKey}-char-count`)
      : undefined;

    const describedBy = useMemo(
      () =>
        [ariaDescribedBy, errorId, helperTextId, characterCountId]
          .filter(Boolean)
          .join(" ") || undefined,
      [ariaDescribedBy, errorId, helperTextId, characterCountId]
    );

    const currentLength = typeof value === "string" ? value.length : 0;
    const showCharacterCount = maxLength !== undefined;

    const labelClasses = [
      styles["textarea-label"],
      required && styles["textarea-label--required"],
    ]
      .filter(Boolean)
      .join(" ");

    const textareaClasses = [
      styles.textarea,
      resize && styles[`textarea--resize-${resize}`],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles["textarea-wrapper"]}>
        <label htmlFor={textareaId} className={labelClasses}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          aria-label={ariaLabel || label}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          aria-disabled={disabled}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          {...textareaProps}
        />
        {showCharacterCount && (
          <div
            id={characterCountId}
            className={styles["textarea-char-count"]}
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </div>
        )}
        {error && (
          <div
            id={errorId}
            className={styles["textarea-error"]}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        {!error && helperText && (
          <div id={helperTextId} className={styles["textarea-helper"]}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default React.memo(Textarea);
