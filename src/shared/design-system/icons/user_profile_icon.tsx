import React from "react";

type Props = {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
};

/**
 * User profile icon SVG component (person silhouette).
 * Used for profile trigger in the sidebar.
 */
const UserProfileIcon = ({ className, size = 16 }: Props) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M3 14c0-2.5 2.5-4 5-4s5 1.5 5 4"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

export default UserProfileIcon;
