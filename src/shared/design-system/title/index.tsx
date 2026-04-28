import React, { memo } from "react";

import styles from "./title.module.scss";

type TitleVariant = "h1" | "h2" | "h3" | "h4";

type Props = {
  children: React.ReactNode;
  variant?: TitleVariant;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

const Title = ({
  children,
  variant = "h1",
  className,
  id,
  "aria-label": ariaLabel,
}: Props) => {
  const titleClasses = [styles.title, styles[`title--${variant}`], className]
    .filter(Boolean)
    .join(" ");

  const HeadingTag = variant;

  return (
    <HeadingTag id={id} className={titleClasses} aria-label={ariaLabel}>
      {children}
    </HeadingTag>
  );
};

export default memo(Title);
