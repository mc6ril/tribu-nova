import React, { useCallback, useId } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { isEnterKey, isSpaceKey } from "@/shared/a11y/utilities";

import styles from "./toggle.module.scss";

type Props = {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  "aria-label"?: string;
};

/**
 * Reusable toggle switch component.
 * Provides an accessible on/off control with keyboard and screen reader support.
 */
const Toggle = ({
  label,
  checked = false,
  disabled = false,
  onChange,
  "aria-label": ariaLabel,
}: Props) => {
  const uniqueId = useId();
  const toggleId = getAccessibilityId(`toggle-${label}-${uniqueId}`);

  const handleToggle = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  }, [disabled, onChange, checked]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isEnterKey(event.nativeEvent) || isSpaceKey(event.nativeEvent)) {
        event.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  const wrapperClasses = [
    styles["toggle"],
    disabled && styles["toggle--disabled"],
  ]
    .filter(Boolean)
    .join(" ");

  const trackClasses = [
    styles["toggle__track"],
    checked && styles["toggle__track--active"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={toggleId} className={wrapperClasses}>
      <span className={styles["toggle__label"]}>{label}</span>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        aria-disabled={disabled}
        disabled={disabled}
        className={trackClasses}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <span className={styles["toggle__thumb"]} />
      </button>
    </label>
  );
};

export default React.memo(Toggle);
