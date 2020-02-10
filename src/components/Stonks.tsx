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
  const element = (
    <div
      key={`stonk_${index}`}
      className={STYLES.stonk}
      style={{ top: `${y}%`, [side]: `${x}px`, transform: `rotate(${rot}deg)` }}
    ></div>
  );
  return { element, y };
};

interface StonksProps {
  overrideSeed?: string;
  overrideStonkLevel?: number;
}

function randn_bm(rand: gen.RandomSeed, to: number): number {
  let u = 0;
  let v = 0;
  while (u === 0) {
    u = rand.random();
  }
  while (v === 0) {
    v = rand.random();
  }
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    return randn_bm(rand, to); // resample between 0 and 1
  }
  return num * to;
}

export const Stonks = ({ overrideSeed, overrideStonkLevel }: StonksProps) => {
  const now = new Date().getTime();
  const seasonOfDawnEnd = new Date(2020, 2, 10, 17, 0, 0).getTime();
  const DAY = 1000 * 60 * 60 * 24;
  const daysUntilEnd = Math.floor((seasonOfDawnEnd - now) / DAY);

  const seed = overrideSeed || seasonOfDawnEnd * new Date().getUTCDate();
  const rand = gen.create(`${seed}`);

  const MAX_STONK_LEVEL = 15;
  const stonkLevel = Math.max(
    Math.min(
      MAX_STONK_LEVEL,
      overrideStonkLevel || MAX_STONK_LEVEL / Math.min(28, daysUntilEnd)
    ),
    1
  );

  const numToCreate = (rand(10) + 10) * stonkLevel;

  const stonks: Array<{ element: JSX.Element; y: number }> = [];
  for (let i = 0; i < numToCreate; i++) {
    const y = rand.floatBetween(-5, 100);
    const maxY = Math.max(1, y);
    const x = rand.floatBetween(
      -60,
      20 * stonkLevel + Math.pow(maxY, maxY / 65)
    );
    const side: StonkSide = rand(100) < 50 ? "left" : "right";
    const rot = rand.floatBetween(0, 360);
    stonks.push(createStonk(i, x, y, side, rot));
  }

  const sortedStonks = stonks.sort((a, b) => a.y - b.y).map(s => s.element);

  return (
    <div className={STYLES.Stonks}>
      <div className={STYLES.stonkContainer}>{sortedStonks}</div>
    </div>
  );
};
