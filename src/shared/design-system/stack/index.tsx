import React from "react";

import styles from "./stack.module.scss";

type StackDirection = "vertical" | "horizontal";
type StackAlign = "start" | "center" | "end" | "stretch";
type StackJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

type Props = {
  /** Stack content */
  children: React.ReactNode;
  /** Stack direction */
  direction?: StackDirection;
  /** Spacing between items (uses spacing scale) */
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Alignment along cross axis */
  align?: StackAlign;
  /** Justification along main axis */
  justify?: StackJustify;
  /** Additional CSS class name */
  className?: string;
  /** HTML element to render as */
  as?: "div" | "section" | "nav" | "ul" | "ol";
};

/**
 * Reusable Stack component for creating consistent vertical or horizontal layouts.
 * Uses Flexbox with gap for spacing between items.
 *
 * @example
 * ```tsx
 * <Stack spacing="md">
 *   <Button label="Button 1" onClick={handleClick1} />
 *   <Button label="Button 2" onClick={handleClick2} />
 * </Stack>
 * ```
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" spacing="lg" justify="space-between">
 *   <Title>Left</Title>
 *   <Button label="Right" onClick={handleClick} />
 * </Stack>
 * ```
 */
const Stack = ({
  children,
  direction = "vertical",
  spacing = "md",
  align,
  justify,
  className,
  as = "div",
}: Props) => {
  const stackClasses = [
    styles.stack,
    styles[`stack--${direction}`],
    spacing && styles[`stack--spacing-${spacing}`],
    align && styles[`stack--align-${align}`],
    justify && styles[`stack--justify-${justify}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const StackTag = as;

  return <StackTag className={stackClasses}>{children}</StackTag>;
};

export default React.memo(Stack);
