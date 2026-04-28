import { type RefObject, useCallback, useEffect, useRef } from "react";

type UseModalAccessibilityParams = {
  isOpen: boolean;
  modalRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
};

const focusFirstFocusableElement = (
  modalElement: HTMLDivElement | null
): void => {
  if (!modalElement) {
    return;
  }

  const [firstFocusableElement] = getFocusableElements(modalElement);
  firstFocusableElement?.focus();
};

export const useModalAccessibility = ({
  isOpen,
  modalRef,
  onClose,
}: UseModalAccessibilityParams): void => {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement;
    focusFirstFocusableElement(modalRef.current);

    return () => {
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen, modalRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(modalRef.current);
      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    },
    [isOpen, modalRef, onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const mainContent = document.querySelector("main");
    if (!mainContent) {
      return;
    }

    mainContent.setAttribute("aria-hidden", "true");
    return () => {
      mainContent.removeAttribute("aria-hidden");
    };
  }, [isOpen]);
};
