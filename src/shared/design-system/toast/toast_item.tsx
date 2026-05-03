"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { getAccessibilityId } from "@/shared/a11y";

import styles from "./toast.module.scss";

type ToastVariant = "success" | "error" | "info" | "warning";

type Props = {
  id: string;
  message: string;
  variant: ToastVariant;
  onDismiss: (id: string) => void;
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

const ToastItem = ({ id, message, variant, onDismiss }: Props) => {
  const t = useTranslations("common");
  const toastRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  useEffect(() => {
    toastRef.current?.focus();
  }, []);

  return (
    <div
      ref={toastRef}
      className={`${styles.toast} ${styles[`toast--${variant}`]}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-label={message}
      id={getAccessibilityId(`toast-${id}`)}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <span className={styles["toast__icon"]} aria-hidden="true">
        {VARIANT_ICONS[variant]}
      </span>
      <p className={styles["toast__message"]}>{message}</p>
      <button
        type="button"
        className={styles["toast__dismiss"]}
        onClick={handleDismiss}
        aria-label={t("dismiss")}
      >
        ×
      </button>
    </div>
  );
};

export default React.memo(ToastItem);
