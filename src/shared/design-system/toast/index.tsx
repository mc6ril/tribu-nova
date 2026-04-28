"use client";

import React, { useCallback } from "react";

import { useToastStore } from "@/shared/stores/useToastStore";

import styles from "./toast.module.scss";
import ToastItem from "./toast_item";

/**
 * Global container that renders all active toasts.
 * Mount once at the app root level (inside AppProvider).
 */
const Toast = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  const handleDismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles["toast-container"]} aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
};

export default React.memo(Toast);
