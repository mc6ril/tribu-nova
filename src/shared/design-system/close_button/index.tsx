import React, { memo } from "react";

import styles from "./close_button.module.scss";

type Props = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  type?: "button" | "submit" | "reset";
};

const CloseButton = ({
  ariaLabel,
  className,
  disabled = false,
  onClick,
  title,
  type = "button",
}: Props) => {
  const buttonClasses = [styles["close-button"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      title={title}
    >
      <span aria-hidden="true" className={styles["close-button__icon"]} />
    </button>
  );
};

export default memo(CloseButton);
