import React from "react";

type Props = {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
};

/**
 * Guide icon SVG component (open book).
 * Used for help and onboarding entry points.
 */
const GuideIcon = ({ className, size = 16 }: Props) => (
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
      d="M2.5 3.25A1.75 1.75 0 0 1 4.25 1.5H7.5v11.75H4.25A1.75 1.75 0 0 0 2.5 15V3.25Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 3.25A1.75 1.75 0 0 0 11.75 1.5H8.5v11.75h3.25A1.75 1.75 0 0 1 13.5 15V3.25Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 4.5h2"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M9.5 4.5h2"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

export default GuideIcon;
