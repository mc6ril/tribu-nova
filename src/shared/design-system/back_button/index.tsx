"use client";

import React, { useCallback } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import styles from "./back_button.module.scss";

type Props = {
  /** Visible label */
  label: string;
  /** Accessible name override (falls back to `label`) */
  ariaLabel?: string;
  /** Where to go when browser history is empty */
  fallbackHref: string;
  /** Additional CSS module classes */
  className?: string;
};

const BackButton = ({ label, ariaLabel, fallbackHref, className }: Props) => {
  const router = useAppRouter();

  const onClick = useCallback((): void => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, router]);

  const buttonId = getAccessibilityId(`back-button-${fallbackHref}`);

  const classes = [styles["back-button"], className].filter(Boolean).join(" ");

  return (
    <button
      id={buttonId}
      type="button"
      className={classes}
      aria-label={ariaLabel ?? label}
      onClick={onClick}
    >
      ← {label}
    </button>
  );
};

export default React.memo(BackButton);
