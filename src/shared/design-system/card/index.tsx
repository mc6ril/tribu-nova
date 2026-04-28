import React, { useCallback } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { isEnterKey, isSpaceKey } from "@/shared/a11y/utilities";
import Title from "@/shared/design-system/title";

import styles from "./card.module.scss";

type CardVariant = "default" | "interactive" | "elevated" | "outlined";

type Props = {
  /** Card content */
  children: React.ReactNode;
  /** Optional card title/header */
  title?: React.ReactNode;
  /** Optional card footer */
  footer?: React.ReactNode;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Card variant style */
  variant?: CardVariant;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
  /** Additional CSS class name for the body wrapper */
  bodyClassName?: string;
};

/**
 * Reusable Card component for displaying content containers.
 * Supports header, body, and footer sections with interactive variants.
 * Includes full accessibility support for clickable cards.
 *
 * @example
 * ```tsx
 * <Card title="Ticket #123" footer={<Button label="View" onClick={handleView} />}>
 *   <p>Card content here</p>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * <Card
 *   variant="interactive"
 *   onClick={handleCardClick}
 *   ariaLabel="Click to view ticket details"
 * >
 *   <p>Clickable card content</p>
 * </Card>
 * ```
 */
const Card = ({
  children,
  title,
  footer,
  onClick,
  variant = "default",
  ariaLabel,
  className,
  bodyClassName,
}: Props) => {
  const cardId = getAccessibilityId("card");

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (!onClick) {
        return;
      }

      if (isEnterKey(event.nativeEvent) || isSpaceKey(event.nativeEvent)) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const cardClasses = [
    styles.card,
    styles[`card--${variant}`],
    onClick && styles["card--clickable"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cardProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: handleKeyDown,
        "aria-label": ariaLabel,
      }
    : {
        role: "article",
        "aria-label": ariaLabel,
      };

  return (
    <div id={cardId} className={cardClasses} {...cardProps}>
      {title && (
        <div className={styles["card__header"]}>
          {typeof title === "string" ? (
            <Title variant="h3" className={styles["card__title"]}>
              {title}
            </Title>
          ) : (
            title
          )}
        </div>
      )}
      <div
        className={[styles["card__body"], bodyClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
      {footer && <div className={styles["card__footer"]}>{footer}</div>}
    </div>
  );
};

export default React.memo(Card);
