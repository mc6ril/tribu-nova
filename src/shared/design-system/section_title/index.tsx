import React, { memo } from "react";

import styles from "./section_title.module.scss";

type SectionTitleTag = "span" | "div" | "label";

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
  as?: SectionTitleTag;
  htmlFor?: string;
};

const SectionTitle = ({
  children,
  className,
  id,
  "aria-label": ariaLabel,
  as = "span",
  htmlFor,
}: Props) => {
  const sectionTitleClasses = [styles["section-title"], className]
    .filter(Boolean)
    .join(" ");
  const ComponentTag = as;

  return (
    <ComponentTag
      id={id}
      className={sectionTitleClasses}
      aria-label={ariaLabel}
      {...(as === "label" && htmlFor ? { htmlFor } : {})}
    >
      {children}
    </ComponentTag>
  );
};

export default memo(SectionTitle);
