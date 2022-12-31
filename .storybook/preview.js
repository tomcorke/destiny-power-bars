import React from "react";
import { AppWrapper } from "../src/App";

export const decorators = [(storyFn) => <AppWrapper>{storyFn()}</AppWrapper>];
