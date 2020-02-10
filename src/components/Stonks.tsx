import gen from "random-seed";
import React from "react";

import STYLES from "./Stonks.module.scss";

type StonkSide = "left" | "right";
const createStonk = (
  index: number,
  x: number,
  y: number,
  side: StonkSide,
  rot: number
) => {
  return (
    <div
      key={`stonk_${index}`}
      className={STYLES.stonk}
      style={{ top: `${y}%`, [side]: `${x}px`, transform: `rotate(${rot}deg)` }}
    ></div>
  );
};

export const Stonks = () => {
  const now = new Date().getTime();
  const seasonOfDawnEnd = new Date(2020, 2, 10, 17, 0, 0).getTime();
  const DAY = 1000 * 60 * 60 * 24;
  const daysUntilEnd = Math.floor((seasonOfDawnEnd - now) / DAY);

  const seed = seasonOfDawnEnd * new Date().getUTCDate();
  const rand = gen.create(`${seed}`);

  const stonkLevel = 10 / Math.max(21, daysUntilEnd);

  const numToCreate = (rand(10) + 10) * stonkLevel;

  const stonks: JSX.Element[] = [];
  for (let i = 0; i < numToCreate; i++) {
    const x = rand(40 + 15 * stonkLevel) - 60;
    const y = rand(110) - 10;
    const side: StonkSide = rand(100) < 50 ? "left" : "right";
    const rot = rand(360);
    stonks.push(createStonk(i, x, y, side, rot));
  }

  return (
    <div className={STYLES.Stonks}>
      <div className={STYLES.stonkContainer}>{stonks}</div>
    </div>
  );
};
