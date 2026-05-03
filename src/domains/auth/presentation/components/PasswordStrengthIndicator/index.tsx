import React, { useMemo } from "react";
import { useTranslations } from "next-intl";

import styles from "./PasswordStrengthIndicator.module.scss";

import {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  MAX_STRENGTH_LEVEL,
  PasswordStrength,
} from "@/domains/auth/presentation/password/passwordStrength";

type Props = {
  password: string;
};

/**
 * Visual indicator for password strength.
 * Displays a segmented bar and a text label (weak / medium / strong).
 * Uses auth-domain password rules for calculation.
 */
const PasswordStrengthIndicator = ({ password }: Props) => {
  const t = useTranslations("pages.signup.passwordStrength");
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (strength === PasswordStrength.NONE) {
    return null;
  }

  const activeSegments = getPasswordStrengthLevel(strength);
  const segmentModifier = `password-strength__bar-segment--active-${strength}`;

  return (
    <div
      className={styles["password-strength"]}
      role="status"
      aria-live="polite"
      aria-label={t(strength)}
    >
      <div className={styles["password-strength__bar-container"]}>
        {Array.from({ length: MAX_STRENGTH_LEVEL }, (_, i) => (
          <div
            key={i}
            className={`${styles["password-strength__bar-segment"]} ${
              i < activeSegments ? styles[segmentModifier] : ""
            }`}
          />
        ))}
      </div>
      <span
        className={`${styles["password-strength__label"]} ${
          styles[`password-strength__label--${strength}`] || ""
        }`}
      >
        {t(strength)}
      </span>
    </div>
  );
};

export default React.memo(PasswordStrengthIndicator);
