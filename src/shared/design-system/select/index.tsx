import type { SelectHTMLAttributes } from "react";
import React, { forwardRef, useMemo } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./select.module.scss";

type SelectOption = {
  value: string;
  label: string;
};

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  /** Select label text */
  label: string;
  /** Options array with value and label */
  options: SelectOption[];
  /** Error message to display below select */
  error?: string;
  /** Helper text to display below select (shown when no error) */
  helperText?: string;
  /** Whether the select is required */
  required?: boolean;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
};

/**
 * Reusable Select component with label, error state, and helper text support.
 * Includes full accessibility support with proper form labeling, error association, and ARIA attributes.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Status"
 *   name="status"
 *   options={[
 *     { value: "active", label: "Active" },
 *     { value: "inactive", label: "Inactive" },
 *   ]}
 *   required
 *   error={errors.status?.message}
 *   helperText="Select a status"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Select
 *   label="Category"
 *   name="category"
 *   options={categories}
 *   placeholder="Choose a category"
 * />
 * ```
 */
const Select = forwardRef<HTMLSelectElement, Props>(
  (
    {
      label,
      options,
      error,
      helperText,
      required = false,
      disabled = false,
      placeholder,
      id,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      value,
      onChange,
      ...selectProps
    },
    ref
  ) => {
    const baseKey = `select-${label}`;
    const selectId = id || getAccessibilityId(baseKey);
    const errorId = error ? getAccessibilityId(`${baseKey}-error`) : undefined;
    const helperTextId = helperText
      ? getAccessibilityId(`${baseKey}-helper`)
      : undefined;

    const describedBy = useMemo(
      () =>
        [ariaDescribedBy, errorId, helperTextId].filter(Boolean).join(" ") ||
        undefined,
      [ariaDescribedBy, errorId, helperTextId]
    );

    const labelClasses = [
      styles["select-label"],
      required && styles["select-label--required"],
    ]
      .filter(Boolean)
      .join(" ");
    const isMultiple = Boolean(selectProps.multiple);
    const selectClasses = [
      styles.select,
      isMultiple && styles["select--multiple"],
    ]
      .filter(Boolean)
      .join(" ");

    const hasValue = value !== undefined && value !== null && value !== "";

    return (
      <div className={styles["select-wrapper"]}>
        <label htmlFor={selectId} className={labelClasses}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          aria-label={ariaLabel || label}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          aria-disabled={disabled}
          disabled={disabled}
          value={value}
          onChange={onChange}
          {...selectProps}
        >
          {placeholder && !isMultiple && !hasValue && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div
            id={errorId}
            className={styles["select-error"]}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        {!error && helperText && (
          <div id={helperTextId} className={styles["select-helper"]}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default React.memo(Select);
