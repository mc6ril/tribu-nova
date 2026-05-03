"use client";

import React, { useCallback, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

import { getAccessibilityId } from "@/shared/a11y/constants";

import ModalDialog from "./components/modal_dialog";
import styles from "./modal.module.scss";
import type { ModalProps } from "./modal.types";
import { useModalAccessibility } from "./use_modal_accessibility";

const subscribeToHydration = (): (() => void) => {
  return () => {};
};

/**
 * Reusable Modal component with focus management and accessibility.
 * Includes focus trapping, body scroll lock, keyboard navigation, and proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Delete Item"
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </Modal>
 * ```
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  hideHeader = false,
  closeOnBackdropClick = true,
  ariaLabel,
  ariaDescribedBy,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common");
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  const modalId = getAccessibilityId("modal");
  const titleId = getAccessibilityId("modal-title");
  const descriptionId =
    ariaDescribedBy ?? getAccessibilityId("modal-description");

  useModalAccessibility({ isOpen, modalRef, onClose });

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  const handleCloseButtonClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const portalTarget = isHydrated ? document.body : null;

  if (!isOpen || portalTarget == null) {
    return null;
  }

  return createPortal(
    <div className={styles["modal-backdrop"]} onClick={handleBackdropClick}>
      <ModalDialog
        modalRef={modalRef}
        modalId={modalId}
        size={size}
        titleId={titleId}
        title={title}
        hideHeader={hideHeader}
        descriptionId={descriptionId}
        ariaDescribedBy={ariaDescribedBy}
        ariaLabel={ariaLabel}
        dismissAriaLabel={t("dismissAriaLabel")}
        dismissLabel={t("dismiss")}
        onCloseButtonClick={handleCloseButtonClick}
        footer={footer}
      >
        {children}
      </ModalDialog>
    </div>,
    portalTarget
  );
};

export default React.memo(Modal);
