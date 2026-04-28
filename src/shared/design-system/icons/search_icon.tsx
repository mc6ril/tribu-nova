import React from "react";

type Props = {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
};

/**
 * Search icon SVG component.
 * Used for search actions and search field affordances.
 */
const SearchIcon = ({ className, size = 16 }: Props) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10.25 10.25L13.25 13.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default SearchIcon;
