import { create } from "zustand";

type ModalState = {
  isOpen: boolean;
  activeModalKey: string | null;
  context: Record<string, unknown> | null;
};

type ModalActions = {
  /**
   * Opens a modal and replaces the active modal key and context.
   * Idempotent: calling openModal repeatedly with the same key is safe.
   */
  openModal: (modalKey: string, context?: Record<string, unknown>) => void;
  /**
   * Closes the modal and clears both modal key and context to prevent ghost state.
   */
  closeModal: () => void;
  setContext: (context: Record<string, unknown> | null) => void;
};

type ModalStore = ModalState & ModalActions;

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  activeModalKey: null,
  context: null,

  openModal: (modalKey: string, context?: Record<string, unknown>): void => {
    set({
      isOpen: true,
      activeModalKey: modalKey,
      context: context ?? null,
    });
  },
  closeModal: (): void => {
    set({
      isOpen: false,
      activeModalKey: null,
      context: null,
    });
  },
  setContext: (context: Record<string, unknown> | null): void => {
    set({ context });
  },
}));
