import classnames from "classnames";
import gen from "random-seed";
import React, { useState } from "react";

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
      style={
        {
          top: `${y}%`,
          [side]: `${x}px`,
          transform: `rotate(${rot}deg)`
        } as any
      }
    ></div>
  );
  return { element, y };
};

interface StonksProps {
  overrideSeed?: string;
  overrideStonkLevel?: number;
}

const getQueryStringNumber = (parameterName: string) => {
  const qs = window.location.search
    .substr(1)
    .split("&")
    .map(q => q.split("="));
  const match = qs.find(
    ([name]) => name.toLowerCase() === parameterName.toLowerCase()
  );
  if (match) {
    try {
      const value = parseInt(match[1], 10);
      return value;
    } catch (e) {
      console.error(
        `Error parsing number value from query parameter ${match[0]}: "${match[1]}"`
      );
    }
  }
  return undefined;
};

export const Stonks = ({ overrideSeed, overrideStonkLevel }: StonksProps) => {
  const now = new Date().getTime();
  const seasonOfDawnEnd = new Date(2020, 2, 10, 17, 0, 0).getTime();
  const DAY = 1000 * 60 * 60 * 24;
  const daysUntilEnd = Math.floor((seasonOfDawnEnd - now) / DAY);

  const seed = overrideSeed || seasonOfDawnEnd * new Date().getUTCDate();
  const rand = gen.create(`${seed}`);

  overrideStonkLevel =
    overrideStonkLevel || getQueryStringNumber("overrideStonkLevel");

  const MAX_STONK_LEVEL = 15;
  const stonkLevel = Math.max(
    Math.min(
      MAX_STONK_LEVEL,
      overrideStonkLevel || MAX_STONK_LEVEL / Math.min(28, daysUntilEnd)
    ),
    1
  );

  const numScalar = 10 * (stonkLevel / MAX_STONK_LEVEL);
  const numToCreate = (rand(10 + numScalar) + 10 + numScalar) * stonkLevel;

  const stonks: Array<{ element: JSX.Element; y: number }> = [];
  for (let i = 0; i < numToCreate; i++) {
    const minY = -5 + (100 / numToCreate) * i;
    const y = rand.floatBetween(minY, 98);
    const yClamp = Math.max(1, y);
    const x =
      rand.floatBetween(
        -30,
        -30 + stonkLevel * (Math.pow(yClamp / 8, 2.7) / MAX_STONK_LEVEL)
      ) - 30;
    const side: StonkSide = rand(100) < 50 ? "left" : "right";
    const rot = rand.floatBetween(-60, 10);
    stonks.push(createStonk(i, x, y, side, rot));
  }

  const sortedStonks = stonks.sort((a, b) => a.y - b.y).map(s => s.element);

  const [hideStonksMessage, setHideStonksMessage] = useState(false);

  return (
    <div className={STYLES.Stonks}>
      <div className={STYLES.stonkContainer}>{sortedStonks}</div>
      <a
        href="https://destiny-stonks.corke.dev"
        target="_blank"
        className={classnames(STYLES.stonksMessage, {
          [STYLES.hidden]: hideStonksMessage
        })}
      >
        <div className={STYLES.header}>Got Fractaline?</div>
        <div className={STYLES.message}>
          See how investing your Fractaline today could yield massive returns in
          the future at{" "}
          {/* tslint-disable-next-line react/jsx-no-target-blank */}
          <span className={STYLES.link}>destiny-stonks.corke.dev</span>
        </div>
        <div
          className={STYLES.closeButton}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setHideStonksMessage(true);
          }}
        />
      </a>
    </div>
  );
};
