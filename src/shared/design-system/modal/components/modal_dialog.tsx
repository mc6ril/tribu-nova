import type { ReactNode, RefObject } from "react";

import styles from "@/shared/design-system/modal/modal.module.scss";
import type { ModalSize } from "@/shared/design-system/modal/modal.types";
import Title from "@/shared/design-system/title";

type Props = {
  modalRef: RefObject<HTMLDivElement | null>;
  modalId: string;
  size: ModalSize;
  titleId: string;
  title: string;
  hideHeader?: boolean;
  descriptionId: string;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissAriaLabel: string;
  dismissLabel: string;
  onCloseButtonClick: () => void;
};

const ModalDialog = ({
  modalRef,
  modalId,
  size,
  titleId,
  title,
  hideHeader = false,
  descriptionId,
  ariaDescribedBy,
  ariaLabel,
  children,
  footer,
  dismissAriaLabel,
  dismissLabel,
  onCloseButtonClick,
}: Props) => {
  const modalClassName = `${styles.modal} ${styles[`modal--${size}`]}`;

  return (
    <div
      ref={modalRef}
      id={modalId}
      className={modalClassName}
      role="dialog"
      aria-modal="true"
      aria-labelledby={hideHeader ? undefined : titleId}
      aria-describedby={ariaDescribedBy ? descriptionId : undefined}
      aria-label={hideHeader ? (ariaLabel ?? title) : ariaLabel}
      onClick={(event) => event.stopPropagation()}
    >
      {!hideHeader ? (
        <div className={styles["modal__header"]}>
          <Title variant="h2" id={titleId} className={styles["modal__title"]}>
            {title}
          </Title>
          <button
            type="button"
            onClick={onCloseButtonClick}
            className={styles["modal__close-button"]}
            aria-label={dismissAriaLabel}
          >
            {dismissLabel}
          </button>
        </div>
      ) : null}

      <div id={descriptionId} className={styles["modal__body"]}>
        {children}
      </div>

      {footer && <div className={styles["modal__footer"]}>{footer}</div>}
    </div>
  );
};

export default ModalDialog;
