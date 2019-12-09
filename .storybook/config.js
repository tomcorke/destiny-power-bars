import React from "react";
import { configure, addParameters } from "@storybook/react";
import { addDecorator } from "@storybook/react";

import { AppWrapper } from "../src/App";

addDecorator(storyFn => <AppWrapper>{storyFn()}</AppWrapper>);

addParameters({
  options: {
    showAddonPanel: false
  }
});

configure(require.context("../src", true, /\.stories\.[tj]sx?$/), module);
