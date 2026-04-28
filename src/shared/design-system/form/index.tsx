import type { FormHTMLAttributes, ReactNode } from "react";
import React, { memo } from "react";

import { getAccessibilityId } from "@/shared/a11y";

import styles from "./form.module.scss";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  legend?: string;
  error?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

const Form = ({
  children,
  legend,
  error,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  className,
  ...formProps
}: Props) => {
  const formClasses = [styles.form, className].filter(Boolean).join(" ");
  const errorId = error ? getAccessibilityId("form-error") : undefined;
  const describedBy =
    [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <form
      className={formClasses}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      {...formProps}
    >
      {legend && (
        <fieldset className={styles["form-fieldset"]}>
          <legend className={styles["form-legend"]}>{legend}</legend>
          {children}
        </fieldset>
      )}
      {!legend && children}
      {error && (
        <div
          id={errorId}
          className={styles["form-error"]}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </form>
  );
};

export default memo(Form);
