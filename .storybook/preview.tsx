import type { Preview } from "@storybook/react-vite";
import React from "react";

import { AppWrapper } from "../src/components/App/App";

export const decorators: Preview["decorators"] = [
  (Story) => (
    <AppWrapper>
      <Story />
    </AppWrapper>
  ),
];
