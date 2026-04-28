import type { ReactNode } from "react";

export type ModalSize = "small" | "medium" | "large" | "full";

export type ModalProps = {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Optional modal footer */
  footer?: ReactNode;
  /** Modal size variant */
  size?: ModalSize;
  /** Whether to hide the standard visual header while keeping the dialog labelled */
  hideHeader?: boolean;
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Custom ARIA label */
  ariaLabel?: string;
  /** Custom ARIA description ID */
  ariaDescribedBy?: string;
};
