import React from "react";
import { addDecorator } from "@storybook/react";

import { AppWrapper } from "../src/App";

addDecorator(storyFn => <AppWrapper>{storyFn()}</AppWrapper>);
