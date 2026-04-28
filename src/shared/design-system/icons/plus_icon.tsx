import React from "react";

type Props = {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
};

/**
 * Plus icon SVG component.
 * Used for add-tab and other add actions in the sidebar.
 */
const PlusIcon = ({ className, size = 16 }: Props) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default PlusIcon;
