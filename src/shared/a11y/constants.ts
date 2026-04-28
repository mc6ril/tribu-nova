/**
 * Accessibility constants and ID generators.
 * Provides centralized accessibility identifiers, ARIA labels, roles, and attribute values
 * to ensure consistent accessibility implementation across the application.
 * All constants follow ARIA specification and WCAG 2.1 AA compliance.
 */

/**
 * Generates a unique, consistent accessibility ID based on a key.
 * IDs follow the pattern: `a11y-{key}` where key is in kebab-case.
 * @param key - The key to generate an ID from (will be converted to kebab-case)
 * @returns A unique accessibility ID string
 * @example
 * ```typescript
 * getAccessibilityId('modal-close-button') // Returns: 'a11y-modal-close-button'
 * getAccessibilityId('form-email-input') // Returns: 'a11y-form-email-input'
 * ```
 */
export const getAccessibilityId = (key: string): string => {
  // Convert key to kebab-case if needed and ensure it starts with a11y- prefix
  const normalizedKey = key
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  return `a11y-${normalizedKey}`;
};

/**
 * ARIA label constants for common button actions.
 * These can be used with i18n system for user-facing labels.
 */
export const BUTTON_LABELS = Object.freeze({
  CLOSE: "close",
  SUBMIT: "submit",
  CANCEL: "cancel",
  SAVE: "save",
  DELETE: "delete",
  EDIT: "edit",
  ADD: "add",
  REMOVE: "remove",
  SEARCH: "search",
  FILTER: "filter",
  RESET: "reset",
  CONFIRM: "confirm",
  BACK: "back",
  NEXT: "next",
  PREVIOUS: "previous",
  EXPAND: "expand",
  COLLAPSE: "collapse",
  MENU: "menu",
  MORE: "more",
});

/**
 * ARIA label constants for form-related elements.
 * These can be used with i18n system for user-facing labels.
 */
export const FORM_LABELS = Object.freeze({
  REQUIRED: "required",
  OPTIONAL: "optional",
  ERROR: "error",
  SUCCESS: "success",
  HELPER_TEXT: "helperText",
  PLACEHOLDER: "placeholder",
  LABEL: "label",
  FIELD: "field",
  VALIDATION: "validation",
});

/**
 * ARIA label constants for navigation elements.
 * These can be used with i18n system for user-facing labels.
 */
export const NAVIGATION_LABELS = Object.freeze({
  MENU: "menu",
  SIDEBAR: "sidebar",
  PAGINATION: "pagination",
  TABS: "tabs",
  SKIP_TO_CONTENT: "skipToContent",
  MAIN_NAVIGATION: "mainNavigation",
});

/**
 * ARIA label constants for status and feedback messages.
 * These can be used with i18n system for user-facing labels.
 */
export const STATUS_LABELS = Object.freeze({
  LOADING: "loading",
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
  EMPTY_STATE: "emptyState",
  NO_RESULTS: "noResults",
});

/**
 * ARIA role constants following ARIA specification.
 * These are the valid values for the `role` attribute.
 */
export const ARIA_ROLES = Object.freeze({
  BUTTON: "button",
  DIALOG: "dialog",
  ALERTDIALOG: "alertdialog",
  TABLIST: "tablist",
  TAB: "tab",
  TABPANEL: "tabpanel",
  MENU: "menu",
  MENUBAR: "menubar",
  MENUITEM: "menuitem",
  NAVIGATION: "navigation",
  BANNER: "banner",
  MAIN: "main",
  COMPLEMENTARY: "complementary",
  CONTENTINFO: "contentinfo",
  SEARCH: "search",
  FORM: "form",
  REGION: "region",
  ALERT: "alert",
  STATUS: "status",
  LOG: "log",
  MARQUEE: "marquee",
  TIMER: "timer",
  PROGRESSBAR: "progressbar",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  SWITCH: "switch",
  TEXTBOX: "textbox",
  LISTBOX: "listbox",
  OPTION: "option",
  LIST: "list",
  LISTITEM: "listitem",
  ARTICLE: "article",
  SECTION: "section",
  HEADING: "heading",
  PRESENTATION: "presentation",
  NONE: "none",
});

/**
 * ARIA live region priority values.
 * Controls how screen readers announce changes to live regions.
 */
export const ARIA_LIVE_VALUES = Object.freeze({
  POLITE: "polite",
  ASSERTIVE: "assertive",
  OFF: "off",
});

/**
 * ARIA expanded state values.
 * Indicates whether a collapsible element is expanded or collapsed.
 */
export const ARIA_EXPANDED_VALUES = Object.freeze({
  TRUE: "true",
  FALSE: "false",
});

/**
 * ARIA selected state values.
 * Indicates whether an element is selected.
 */
export const ARIA_SELECTED_VALUES = Object.freeze({
  TRUE: "true",
  FALSE: "false",
});

/**
 * ARIA hidden state values.
 * Indicates whether an element is hidden from assistive technologies.
 */
export const ARIA_HIDDEN_VALUES = Object.freeze({
  TRUE: "true",
  FALSE: "false",
});

/**
 * ARIA invalid state values.
 * Indicates whether an element's value is invalid.
 */
export const ARIA_INVALID_VALUES = Object.freeze({
  TRUE: "true",
  FALSE: "false",
  GRAMMAR: "grammar",
  SPELLING: "spelling",
});

/**
 * ARIA required state values.
 * Indicates whether an element is required.
 */
export const ARIA_REQUIRED_VALUES = Object.freeze({
  TRUE: "true",
  FALSE: "false",
});

/**
 * ARIA checked state values.
 * Indicates whether a checkbox, radio button, or switch is checked.
 */
export const ARIA_CHECKED_VALUES = Object.freeze({
  TRUE: "true",
  FALSE: "false",
  MIXED: "mixed",
});

/**
 * ARIA orientation values.
 * Indicates the orientation of an element (horizontal or vertical).
 */
export const ARIA_ORIENTATION_VALUES = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
});

/**
 * Type for ARIA live region priority values.
 */
export type AriaLiveValue =
  | typeof ARIA_LIVE_VALUES.POLITE
  | typeof ARIA_LIVE_VALUES.ASSERTIVE
  | typeof ARIA_LIVE_VALUES.OFF;

/**
 * Type for ARIA expanded state values.
 */
export type AriaExpandedValue =
  | typeof ARIA_EXPANDED_VALUES.TRUE
  | typeof ARIA_EXPANDED_VALUES.FALSE;

/**
 * Type for ARIA selected state values.
 */
export type AriaSelectedValue =
  | typeof ARIA_SELECTED_VALUES.TRUE
  | typeof ARIA_SELECTED_VALUES.FALSE;

/**
 * Type for ARIA hidden state values.
 */
export type AriaHiddenValue =
  | typeof ARIA_HIDDEN_VALUES.TRUE
  | typeof ARIA_HIDDEN_VALUES.FALSE;

/**
 * Type for ARIA invalid state values.
 */
export type AriaInvalidValue =
  | typeof ARIA_INVALID_VALUES.TRUE
  | typeof ARIA_INVALID_VALUES.FALSE
  | typeof ARIA_INVALID_VALUES.GRAMMAR
  | typeof ARIA_INVALID_VALUES.SPELLING;

/**
 * Type for ARIA required state values.
 */
export type AriaRequiredValue =
  | typeof ARIA_REQUIRED_VALUES.TRUE
  | typeof ARIA_REQUIRED_VALUES.FALSE;

/**
 * Type for ARIA checked state values.
 */
export type AriaCheckedValue =
  | typeof ARIA_CHECKED_VALUES.TRUE
  | typeof ARIA_CHECKED_VALUES.FALSE
  | typeof ARIA_CHECKED_VALUES.MIXED;

/**
 * Type for ARIA orientation values.
 */
export type AriaOrientationValue =
  | typeof ARIA_ORIENTATION_VALUES.HORIZONTAL
  | typeof ARIA_ORIENTATION_VALUES.VERTICAL;

/**
 * Type for ARIA role values.
 * Union of all valid ARIA role constants.
 */
export type AriaRole =
  | typeof ARIA_ROLES.BUTTON
  | typeof ARIA_ROLES.DIALOG
  | typeof ARIA_ROLES.ALERTDIALOG
  | typeof ARIA_ROLES.TABLIST
  | typeof ARIA_ROLES.TAB
  | typeof ARIA_ROLES.TABPANEL
  | typeof ARIA_ROLES.MENU
  | typeof ARIA_ROLES.MENUBAR
  | typeof ARIA_ROLES.MENUITEM
  | typeof ARIA_ROLES.NAVIGATION
  | typeof ARIA_ROLES.BANNER
  | typeof ARIA_ROLES.MAIN
  | typeof ARIA_ROLES.COMPLEMENTARY
  | typeof ARIA_ROLES.CONTENTINFO
  | typeof ARIA_ROLES.SEARCH
  | typeof ARIA_ROLES.FORM
  | typeof ARIA_ROLES.REGION
  | typeof ARIA_ROLES.ALERT
  | typeof ARIA_ROLES.STATUS
  | typeof ARIA_ROLES.LOG
  | typeof ARIA_ROLES.MARQUEE
  | typeof ARIA_ROLES.TIMER
  | typeof ARIA_ROLES.PROGRESSBAR
  | typeof ARIA_ROLES.CHECKBOX
  | typeof ARIA_ROLES.RADIO
  | typeof ARIA_ROLES.SWITCH
  | typeof ARIA_ROLES.TEXTBOX
  | typeof ARIA_ROLES.LISTBOX
  | typeof ARIA_ROLES.OPTION
  | typeof ARIA_ROLES.LIST
  | typeof ARIA_ROLES.LISTITEM
  | typeof ARIA_ROLES.ARTICLE
  | typeof ARIA_ROLES.SECTION
  | typeof ARIA_ROLES.HEADING
  | typeof ARIA_ROLES.PRESENTATION
  | typeof ARIA_ROLES.NONE;
