import classNames from "classnames";
import React, { useState } from "react";

import { useTimeout } from "../hooks/useTimeout";

import STYLES from "./Toast.module.scss";

type ToastProps = {
  children: React.ReactChild;
  onDelete: () => void;
};

const ONE_MINUTE = 60 * 1000;
const TOAST_TIMEOUT = 2 * ONE_MINUTE;

export const Toast = ({ children, onDelete }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useTimeout(() => setIsVisible(true), 100);
  useTimeout(() => setIsVisible(false), TOAST_TIMEOUT);
  useTimeout(() => onDelete(), TOAST_TIMEOUT + 1000);

  const deleteAfterSmallDelay = () => {
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
