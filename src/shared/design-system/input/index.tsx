import type { InputHTMLAttributes } from "react";
import React, { forwardRef, useCallback, useState } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { EyeIcon, EyeOffIcon } from "@/shared/design-system/icons";
import { useTranslations } from "@/shared/i18n";

import styles from "./input.module.scss";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  /** Input label text */
  label?: string;
  /** Error message to display below input */
  error?: string;
  /** Helper text to display below input (shown when no error) */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
  /** Custom placeholder for the input */
  placeholder?: string;
  /** Is input inline with the label */
  inline?: boolean;
};

/**
 * Reusable Input component with label, error state, helper text, and password toggle support.
 * For password inputs, a visibility toggle button is automatically rendered.
 * Includes full accessibility support with proper form labeling, error association, and ARIA attributes.
 */
const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      placeholder,
      id,
      type,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      inline = false,
      ...inputProps
    },
    ref
  ) => {
    const isPasswordType = type === "password";
    const [passwordVisible, setPasswordVisible] = useState(false);
    const t = useTranslations("common.passwordToggle");

    const togglePasswordVisibility = useCallback(() => {
      setPasswordVisible((prev) => !prev);
    }, []);

    const resolvedType = isPasswordType && passwordVisible ? "text" : type;

    const baseKey = `input-${label}`;
    const inputId = id || getAccessibilityId(baseKey);
    const errorId = error ? getAccessibilityId(`${baseKey}-error`) : undefined;
    const helperTextId =
      helperText && !error
        ? getAccessibilityId(`${baseKey}-helper`)
        : undefined;
    const describedBy =
      [ariaDescribedBy, errorId, helperTextId].filter(Boolean).join(" ") ||
      undefined;

    const wrapperClasses = [
      styles["input-wrapper"],
      inline && styles["input-wrapper--inline"],
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      styles["input-label"],
      required && styles["input-label--required"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <div className={styles["input-field-wrapper"]}>
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={`${styles.input} ${isPasswordType ? styles["input--has-toggle"] : ""}`}
            aria-label={ariaLabel || label}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            aria-required={required}
            aria-disabled={disabled}
            placeholder={placeholder}
            disabled={disabled}
            {...inputProps}
          />
          {isPasswordType && (
            <button
              type="button"
              className={styles["input-password-toggle"]}
              onClick={togglePasswordVisibility}
              disabled={disabled}
              aria-label={passwordVisible ? t("hide") : t("show")}
            >
              {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {error && (
          <div
            id={errorId}
            className={styles["input-error"]}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        {!error && helperText && (
          <div id={helperTextId} className={styles["input-helper"]}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default React.memo(Input);
