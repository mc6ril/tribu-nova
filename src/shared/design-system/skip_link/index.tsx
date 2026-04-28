import React from "react";
import Link from "next/link";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./skip_link.module.scss";

type Props = {
  targetId: string;
  label: string;
};

const SkipLink = ({ targetId, label }: Props) => {
  const skipLinkId = getAccessibilityId("skip-link");

  return (
    <Link id={skipLinkId} className={styles["skip-link"]} href={`#${targetId}`}>
      {label}
    </Link>
  );
};

export default React.memo(SkipLink);
