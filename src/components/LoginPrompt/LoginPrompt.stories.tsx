import React from "react";
import { action } from "storybook/actions";

import LoginPrompt from "./LoginPrompt";

const story = {
  title: "Login Prompt",
};
export default story;

export const display = () => (
  <LoginPrompt onLoginClick={action("login button click")} />
);
