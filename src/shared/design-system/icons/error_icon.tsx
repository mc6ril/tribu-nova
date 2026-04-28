import React from "react";

type Props = {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
};

/**
 * Error icon SVG component.
 * Displays a simple alert circle icon for visual error indication.
 *
 * @example
 * ```tsx
 * <ErrorIcon className={styles.icon} size={20} />
 * ```
 */
const ErrorIcon = ({ className, size = 20 }: Props) => (
  <svg
    className={className}
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
    <line
      x1="10"
      y1="6"
      x2="10"
      y2="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="12"
      x2="10"
      y2="14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default ErrorIcon;
