import classnames from "classnames";
import React from "react";

import STYLES from "./LoadingChecklist.module.scss";

export type LoadingChecklistItemStatus = "complete" | "pending" | "failed";

export interface LoadingChecklistItem {
  label: string;
  status: LoadingChecklistItemStatus;
}

interface LoadingChecklistProps {
  items: LoadingChecklistItem[];
  withTopMargin?: boolean;
}

export const LoadingChecklist = ({
  items,
  withTopMargin,
}: LoadingChecklistProps) => {
  return (
    <div
      className={classnames(STYLES.LoadingChecklist, {
        [STYLES.topMargin]: withTopMargin,
      })}
    >
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <div className={STYLES.item}>
              <div className={classnames(STYLES.status, STYLES[item.status])} />
              {item.label}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
