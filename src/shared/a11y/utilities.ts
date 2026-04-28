/**
 * Accessibility utilities and helper functions.
 * Provides centralized accessibility logic to ensure WCAG 2.1 AA compliance.
 * All utilities are pure TypeScript functions with no external dependencies.
 */

/**
 * Priority level for ARIA live regions.
 */
export type AriaLivePriority = "polite" | "assertive";

/**
 * Keyboard event handlers for navigation.
 * Each property is an optional callback function for the corresponding key.
 */
export type KeyboardHandlers = {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
};

/**
 * CSS selector for focusable elements.
 * Includes standard interactive elements and elements with tabindex >= 0.
 */
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Gets all focusable elements within a container.
 * @param container - The container element to search within
 * @returns Array of focusable elements
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
  return elements.filter((el) => {
    // Filter out disabled and hidden elements
    return (
      !el.hasAttribute("disabled") &&
      !el.hasAttribute("aria-hidden") &&
      el.offsetParent !== null
    );
  });
};

/**
 * Traps keyboard focus within the specified element.
 * Prevents focus from escaping the container using Tab/Shift+Tab navigation.
 * @param element - The container element to trap focus within
 * @returns Cleanup function to remove the focus trap and restore previous focus
 * @example
 * ```typescript
 * const cleanup = trapFocus(modalElement);
 * // Later, when closing the modal:
 * cleanup();
 * ```
 */
export const trapFocus = (element: HTMLElement): (() => void) => {
  const previouslyFocusedElement = document.activeElement as HTMLElement | null;
  const focusableElements = getFocusableElements(element);

  // Focus first element if container has focusable elements
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") {
      return;
    }

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentElement = document.activeElement as HTMLElement | null;

    // Check if the event target is within the container
    const target = event.target as HTMLElement | null;
    const isTargetInContainer = target && element.contains(target);

    if (
      !currentElement ||
      (!focusableElements.includes(currentElement) && !isTargetInContainer)
    ) {
      // If focus is outside the container, focus based on navigation direction
      event.preventDefault();
      if (event.shiftKey) {
        // Shift+Tab (backward): focus last element
        lastElement.focus();
      } else {
        // Tab (forward): focus first element
        firstElement.focus();
      }
      return;
    }

    if (event.shiftKey) {
      // Shift+Tab: move to previous element
      if (currentElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move to next element
      if (currentElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Use capture phase on document to catch Tab events even when focus is outside container
  document.addEventListener("keydown", handleKeyDown, true);

  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleKeyDown, true);
    if (
      previouslyFocusedElement &&
      typeof previouslyFocusedElement.focus === "function"
    ) {
      previouslyFocusedElement.focus();
    }
  };
};

/**
 * Returns focus to the specified element.
 * Safe to call even if the element is not currently focusable.
 * @param element - The element to return focus to
 * @example
 * ```typescript
 * // Store element before opening modal
 * const triggerButton = document.getElementById('open-modal');
 * // Open modal...
 * // Later, when closing modal:
 * returnFocus(triggerButton);
 * ```
 */
export const returnFocus = (element: HTMLElement): void => {
  if (element && typeof element.focus === "function") {
    element.focus();
  }
};

/**
 * Finds and focuses the first focusable element within a container.
 * @param container - The container element to search within
 * @example
 * ```typescript
 * focusFirstFocusable(modalElement);
 * ```
 */
export const focusFirstFocusable = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
};

/**
 * Finds and focuses the last focusable element within a container.
 * @param container - The container element to search within
 * @example
 * ```typescript
 * focusLastFocusable(modalElement);
 * ```
 */
export const focusLastFocusable = (container: HTMLElement): void => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    const lastElement = focusableElements[focusableElements.length - 1];
    lastElement.focus();
  }
};

/**
 * Sets the aria-label attribute on an element.
 * @param element - The element to set the aria-label on
 * @param label - The label text to set
 * @example
 * ```typescript
 * setAriaLabel(buttonElement, 'Close dialog');
 * ```
 */
export const setAriaLabel = (element: HTMLElement, label: string): void => {
  element.setAttribute("aria-label", label);
};

/**
 * Sets the aria-describedby attribute on an element.
 * Appends to existing value if present, separated by spaces.
 * Prevents duplicate IDs from being added.
 * @param element - The element to set the aria-describedby on
 * @param id - The ID of the element that describes this element
 * @example
 * ```typescript
 * setAriaDescribedBy(inputElement, 'error-message-id');
 * ```
 */
export const setAriaDescribedBy = (element: HTMLElement, id: string): void => {
  const existing = element.getAttribute("aria-describedby");
  if (existing) {
    // Split existing IDs and check for duplicates
    const existingIds = existing.trim().split(/\s+/);
    if (!existingIds.includes(id)) {
      element.setAttribute("aria-describedby", `${existing} ${id}`);
    }
  } else {
    element.setAttribute("aria-describedby", id);
  }
};

/**
 * Sets the aria-live attribute on an element.
 * @param element - The element to set the aria-live on
 * @param priority - The priority level ('polite' or 'assertive')
 * @example
 * ```typescript
 * setAriaLive(statusElement, 'assertive');
 * ```
 */
export const setAriaLive = (
  element: HTMLElement,
  priority: AriaLivePriority
): void => {
  element.setAttribute("aria-live", priority);
};

/**
 * Hidden live region element for screen reader announcements.
 * Created on first use and reused for subsequent announcements.
 */
let liveRegionElement: HTMLElement | null = null;

/**
 * Pending announcement timeout ID to prevent interleaving.
 */
let pendingAnnouncementTimeout: number | null = null;

/**
 * Gets or creates the hidden live region element for announcements.
 * @returns The live region element
 */
const getLiveRegionElement = (): HTMLElement => {
  if (!liveRegionElement) {
    liveRegionElement = document.createElement("div");
    liveRegionElement.setAttribute("aria-live", "polite");
    liveRegionElement.setAttribute("aria-atomic", "true");
    liveRegionElement.style.position = "absolute";
    liveRegionElement.style.left = "-10000px";
    liveRegionElement.style.width = "1px";
    liveRegionElement.style.height = "1px";
    liveRegionElement.style.overflow = "hidden";
    document.body.appendChild(liveRegionElement);
  }
  return liveRegionElement;
};

/**
 * Announces a message to screen readers using a live region.
 * Creates a hidden live region element if it doesn't exist and updates it with the message.
 * Uses requestAnimationFrame to ensure proper timing and prevent interleaving of rapid announcements.
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 * @example
 * ```typescript
 * announceToScreenReader('Form submitted successfully', 'polite');
 * announceToScreenReader('Error: Please check your input', 'assertive');
 * ```
 */
export const announceToScreenReader = (
  message: string,
  priority: AriaLivePriority = "polite"
): void => {
  const liveRegion = getLiveRegionElement();
  liveRegion.setAttribute("aria-live", priority);
  liveRegion.setAttribute("aria-atomic", "true");

  // Clear any pending announcement
  if (pendingAnnouncementTimeout !== null) {
    clearTimeout(pendingAnnouncementTimeout);
    pendingAnnouncementTimeout = null;
  }

  // Clear previous content
  liveRegion.textContent = "";

  // Use requestAnimationFrame to ensure DOM update is processed before setting new content
  requestAnimationFrame(() => {
    // Use setTimeout to ensure the clear is fully processed by screen readers
    pendingAnnouncementTimeout = window.setTimeout(() => {
      liveRegion.textContent = message;
      pendingAnnouncementTimeout = null;
    }, 100);
  });
};

/**
 * Checks if a keyboard event is the Escape key.
 * @param event - The keyboard event to check
 * @returns true if the event is the Escape key
 * @example
 * ```typescript
 * if (isEscapeKey(event)) {
 *   closeModal();
 * }
 * ```
 */
export const isEscapeKey = (event: KeyboardEvent): boolean => {
  return event.key === "Escape" || event.keyCode === 27;
};

/**
 * Checks if a keyboard event is the Enter key.
 * @param event - The keyboard event to check
 * @returns true if the event is the Enter key
 * @example
 * ```typescript
 * if (isEnterKey(event)) {
 *   submitForm();
 * }
 * ```
 */
export const isEnterKey = (event: KeyboardEvent): boolean => {
  return event.key === "Enter" || event.keyCode === 13;
};

/**
 * Checks if a keyboard event is the Space key.
 * @param event - The keyboard event to check
 * @returns true if the event is the Space key
 * @example
 * ```typescript
 * if (isSpaceKey(event)) {
 *   event.preventDefault();
 *   toggleButton();
 * }
 * ```
 */
export const isSpaceKey = (event: KeyboardEvent): boolean => {
  return event.key === " " || event.key === "Spacebar" || event.keyCode === 32;
};

/**
 * Handles keyboard navigation by calling appropriate handlers based on the pressed key.
 * @param event - The keyboard event to handle
 * @param handlers - Object containing optional handler functions for different keys
 * @example
 * ```typescript
 * handleKeyboardNavigation(event, {
 *   onEscape: () => closeModal(),
 *   onEnter: () => submitForm(),
 *   onArrowDown: () => moveToNextItem(),
 * });
 * ```
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  handlers: KeyboardHandlers
): void => {
  if (isEscapeKey(event) && handlers.onEscape) {
    event.preventDefault();
    handlers.onEscape();
    return;
  }

  if (isEnterKey(event) && handlers.onEnter) {
    event.preventDefault();
    handlers.onEnter();
    return;
  }

  if (isSpaceKey(event) && handlers.onSpace) {
    event.preventDefault();
    handlers.onSpace();
    return;
  }

  if (event.key === "ArrowUp" && handlers.onArrowUp) {
    event.preventDefault();
    handlers.onArrowUp();
    return;
  }

  if (event.key === "ArrowDown" && handlers.onArrowDown) {
    event.preventDefault();
    handlers.onArrowDown();
    return;
  }

  if (event.key === "ArrowLeft" && handlers.onArrowLeft) {
    event.preventDefault();
    handlers.onArrowLeft();
    return;
  }

  if (event.key === "ArrowRight" && handlers.onArrowRight) {
    event.preventDefault();
    handlers.onArrowRight();
    return;
  }
};
