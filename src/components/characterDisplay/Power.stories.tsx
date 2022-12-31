import React from "react";

import { Power } from "./Power";

const story = {
  title: "Power Number Display",
};
export default story;

export const display = () => <Power>{321}</Power>;

export const withSymbol = () => <Power withSymbol>{456}</Power>;
