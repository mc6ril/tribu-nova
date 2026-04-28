import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Link from "@/shared/design-system/link";
import Title from "@/shared/design-system/title";

import styles from "./route_fallback_page.module.scss";

type RouteFallbackTone = "loading" | "notFound" | "error";
type RouteFallbackActionVariant = "primary" | "secondary";

export type RouteFallbackAction = {
  label: string;
  ariaLabel?: string;
  variant?: RouteFallbackActionVariant;
} & (
  | {
      href: string;
      onClick?: never;
    }
  | {
      onClick: () => void;
      href?: never;
    }
);

type Props = {
  tone: RouteFallbackTone;
  eyebrow: string;
  statusLabel: string;
  title: string;
  message: string;
  detail?: string;
  statusValue?: string;
  actions?: readonly RouteFallbackAction[];
  ariaLabel?: string;
};

const RouteFallbackPage = ({
  tone,
  eyebrow,
  statusLabel,
  title,
  message,
  detail,
  statusValue,
  actions = [],
  ariaLabel,
}: Props) => {
  const titleId = getAccessibilityId(`route-fallback-${tone}-title`);
  const messageId = getAccessibilityId(`route-fallback-${tone}-message`);
  const detailId = detail
    ? getAccessibilityId(`route-fallback-${tone}-detail`)
    : undefined;
  const describedBy =
    [messageId, detailId].filter(Boolean).join(" ") || undefined;
  const isLoading = tone === "loading";

  const fallbackClasses = [
    styles["route-fallback"],
    styles[`route-fallback--${tone}`],
  ]
    .filter(Boolean)
    .join(" ");

  const panelClasses = [
    styles["route-fallback__panel"],
    styles[`route-fallback__panel--${tone}`],
  ]
    .filter(Boolean)
    .join(" ");

  const displayStatusValue =
    statusValue ??
    (tone === "notFound" ? "404" : tone === "error" ? "500" : "");

  return (
    <main className={fallbackClasses} aria-labelledby={titleId}>
      <div className={styles["route-fallback__glow"]} aria-hidden="true" />
      <section
        className={panelClasses}
        role={isLoading ? "status" : undefined}
        aria-live={isLoading ? "polite" : undefined}
        aria-busy={isLoading ? "true" : undefined}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
      >
        <div className={styles["route-fallback__copy"]}>
          <div className={styles["route-fallback__eyebrow"]}>{eyebrow}</div>
          <span className={styles["route-fallback__status"]}>
            {statusLabel}
          </span>
          <Title
            variant="h1"
            id={titleId}
            className={styles["route-fallback__title"]}
          >
            {title}
          </Title>
          <p id={messageId} className={styles["route-fallback__message"]}>
            {message}
          </p>
          {detail && (
            <p id={detailId} className={styles["route-fallback__detail"]}>
              {detail}
            </p>
          )}

          {actions.length > 0 && (
            <div className={styles["route-fallback__actions"]}>
              {actions.map((action) => {
                const actionVariant = action.variant ?? "secondary";
                const actionClasses = [
                  styles["route-fallback__action"],
                  styles[`route-fallback__action--${actionVariant}`],
                ]
                  .filter(Boolean)
                  .join(" ");
                const href = "href" in action ? action.href : undefined;

                if (typeof href === "string") {
                  return (
                    <Link
                      key={`${action.label}-${href}`}
                      href={href}
                      unstyled
                      className={actionClasses}
                      ariaLabel={action.ariaLabel ?? action.label}
                    >
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={action.label}
                    type="button"
                    className={actionClasses}
                    onClick={action.onClick}
                    aria-label={action.ariaLabel ?? action.label}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles["route-fallback__visual"]} aria-hidden="true">
          <div className={styles["route-fallback__visual-frame"]}>
            {isLoading ? (
              <div className={styles["route-fallback__loading-board"]}>
                {Array.from({ length: 3 }, (_, columnIndex) => (
                  <div
                    key={`loading-column-${columnIndex}`}
                    className={styles["route-fallback__loading-column"]}
                  >
                    <div
                      className={
                        styles["route-fallback__loading-column-header"]
                      }
                    />
                    <div className={styles["route-fallback__loading-card"]} />
                    <div className={styles["route-fallback__loading-card"]} />
                    <div
                      className={styles["route-fallback__loading-card--small"]}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className={styles["route-fallback__status-value"]}>
                  {displayStatusValue}
                </div>
                <div className={styles["route-fallback__status-card"]}>
                  <div className={styles["route-fallback__status-card-label"]}>
                    {statusLabel}
                  </div>
                  <div className={styles["route-fallback__status-card-line"]} />
                  <div
                    className={`${styles["route-fallback__status-card-line"]} ${styles["route-fallback__status-card-line--short"]}`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default React.memo(RouteFallbackPage);
