import { action } from "@storybook/addon-actions";
import React from "react";

import LoginPrompt from "./LoginPrompt";

const story = {
  title: "Login Prompt",
};
export default story;

export const display = () => (
  <LoginPrompt onLoginClick={action("login button click")} />
);
