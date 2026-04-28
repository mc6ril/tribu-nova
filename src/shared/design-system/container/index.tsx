import React from "react";

import styles from "./container.module.scss";

type ContainerSize = "small" | "medium" | "large" | "full";

type Props = {
  /** Container content */
  children: React.ReactNode;
  /** Maximum width variant */
  maxWidth?: ContainerSize;
  /** Custom padding override */
  padding?: string;
  /** Additional CSS class name */
  className?: string;
  /** HTML element to render as */
  as?: "div" | "main" | "section" | "article";
};

/**
 * Reusable Container component for consistent page layouts.
 * Provides max-width constraint, horizontal centering, and responsive padding.
 *
 * @example
 * ```tsx
 * <Container>
 *   <Title variant="h1">Page Title</Title>
 *   <p>Content here</p>
 * </Container>
 * ```
 *
 * @example
 * ```tsx
 * <Container maxWidth="large" as="main">
 *   <ArticleContent />
 * </Container>
 * ```
 */
const Container = ({
  children,
  maxWidth = "medium",
  padding,
  className,
  as = "div",
}: Props) => {
  const containerClasses = [
    styles.container,
    styles[`container--${maxWidth}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const ContainerTag = as;

  return (
    <ContainerTag
      className={containerClasses}
      style={padding ? { padding } : undefined}
    >
      {children}
    </ContainerTag>
  );
};

export default React.memo(Container);
