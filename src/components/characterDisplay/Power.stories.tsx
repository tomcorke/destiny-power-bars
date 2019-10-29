import { DecoratorFn } from "@storybook/react";
import React from "react";

import { AppWrapper } from "../../App";
import { Power } from "./Power";

export default {
  title: "Power Number Display"
};

export const display = () => <Power>321</Power>;
