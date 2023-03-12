import React, { useState } from "react";

import { EVENTS, useEvent } from "../../services/events";
import { Power } from "../characterDisplayComponents/Power";

import { Toast } from "./Toast";
import STYLES from "./ToastOverlay.module.scss";

export const ToastOverlay = () => {
  const [toasts, setToasts] = useState<
    { id: string; icon: string; name: string; power: number }[]
  >([]);

  useEvent<{
    itemInstanceId: string;
    name: string;
    icon: string;
    power: number;
  }>(EVENTS.ITEM_LOCKED, ({ itemInstanceId, name, icon, power }) => {
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: itemInstanceId,
        name,
        icon,
        power,
      },
    ]);
  });

  const deleteToast = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  };

  return (
    <div className={STYLES.ToastOverlay}>
      {toasts.map(({ id, name, icon, power }) => (
        <Toast onDelete={() => deleteToast(id)} key={id}>
          <div className={STYLES.ItemLockedToast}>
            <div>Locked</div>
            <img src={`https://www.bungie.net${icon}`} alt={name} />
            <div>
              {name} at <Power>{power}</Power> power
            </div>
          </div>
        </Toast>
      ))}
    </div>
  );
};
