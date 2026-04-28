import React, { memo } from "react";

import styles from "./text.module.scss";

type TextVariant = "body" | "small" | "caption" | "metric";

type Props = {
  children: React.ReactNode;
  variant?: TextVariant;
  className?: string;
  id?: string;
  "aria-label"?: string;
  as?: "p" | "span" | "div";
};

const Text = ({
  children,
  variant = "body",
  className,
  id,
  "aria-label": ariaLabel,
  as = "p",
}: Props) => {
  const textClasses = [styles.text, styles[`text--${variant}`], className]
    .filter(Boolean)
    .join(" ");

  const TextTag = as;

  return (
    <TextTag id={id} className={textClasses} aria-label={ariaLabel}>
      {children}
    </TextTag>
  );
};

export default memo(Text);
