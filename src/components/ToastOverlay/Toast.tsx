import classNames from "classnames";
import React, { useState } from "react";

import { useTimeout } from "../hooks/useTimeout";

import STYLES from "./Toast.module.scss";

type ToastProps = {
  children: React.ReactChild;
  onDelete: () => void;
};

export const Toast = ({ children, onDelete }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useTimeout(() => setIsVisible(true), 100);
  useTimeout(() => setIsVisible(false), 2 * 60 * 1000);
  useTimeout(() => onDelete(), 2 * 60 * 1000 + 2000);

  const deleteAfterSmallDelay = () => {
    console.log("click delete");
    setTimeout(onDelete, 50);
  };

  return (
    <div
      className={classNames(STYLES.Toast, { [STYLES.hidden]: !isVisible })}
      onClick={deleteAfterSmallDelay}
    >
      {children}
    </div>
  );
};
