import React from "react";
import Image from "next/image";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./avatar.module.scss";
import { getAvatarInitials } from "./get_avatar_initials";

type AvatarSize = "sm" | "md" | "lg" | "xl";

/** Pixel dimensions for each avatar size variant (must match SCSS variables). */
const AVATAR_SIZE_PX: Record<AvatarSize, number> = {
  sm: 28,
  md: 32,
  lg: 48,
  xl: 64,
};

const TRANSPARENT_PIXEL_DATA_URI =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

type Props = {
  /** URL of the avatar image */
  src?: string | null;
  /** User display name (used for initials fallback and alt text) */
  name?: string | null;
  /** Avatar size variant */
  size?: AvatarSize;
  /** Custom ARIA label */
  "aria-label"?: string;
};

/**
 * Reusable Avatar component with image and initials fallback.
 * Displays a user avatar image, or shows initials when no image is available.
 * Supports multiple sizes and proper accessibility attributes.
 */
const Avatar = ({ src, name, size = "md", "aria-label": ariaLabel }: Props) => {
  const initials = getAvatarInitials(name);
  const avatarId = getAccessibilityId("avatar-utilisateur");
  const displayLabel = ariaLabel ?? "User avatar";
  const sizePx = AVATAR_SIZE_PX[size];

  const containerClasses = [styles.avatar, styles[`avatar--${size}`]]
    .filter(Boolean)
    .join(" ");
  const imageClasses = [
    styles.avatar__image,
    !src ? styles["avatar__image--hidden"] : "",
  ]
    .filter(Boolean)
    .join(" ");
  const initialsClasses = [
    styles.avatar__initials,
    src ? styles["avatar__initials--hidden"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={avatarId}
      className={containerClasses}
      role="img"
      aria-label={displayLabel}
    >
      <Image
        src={src ?? TRANSPARENT_PIXEL_DATA_URI}
        alt={displayLabel}
        width={sizePx}
        height={sizePx}
        className={imageClasses}
        unoptimized={!src}
      />
      <span className={initialsClasses} aria-hidden="true">
        {initials}
      </span>
    </div>
  );
};

export default React.memo(Avatar);
