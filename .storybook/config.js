import React from "react";
import { configure } from "@storybook/react";
import { addDecorator } from "@storybook/react";

import { AppWrapper } from "../src/App";

addDecorator(storyFn => <AppWrapper>{storyFn()}</AppWrapper>);

configure(require.context("../src", true, /\.stories\.[tj]sx?$/), module);
