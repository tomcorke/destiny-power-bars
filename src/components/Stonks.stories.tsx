import random from "random-seed";
import React, { useState } from "react";

import { Stonks } from "./Stonks";

export default { title: "Stonks", component: Stonks };

export const display = () => <Stonks />;

export const withFixedSeed = () => <Stonks overrideSeed="fixed-seed" />;

const rand = random.create();

export const useWithCurrentStonkLevel = () => {
  const [seed, setSeed] = useState(rand.string(10));

  return (
    <div onClick={() => setSeed(rand.string(10))}>
      <Stonks overrideSeed={seed} />
    </div>
  );
};

export const useWithMaxStonkLevel = () => {
  const [seed, setSeed] = useState(rand.string(10));

  return (
    <div onClick={() => setSeed(rand.string(10))}>
      <Stonks overrideSeed={seed} overrideStonkLevel={Infinity} />
    </div>
  );
};
