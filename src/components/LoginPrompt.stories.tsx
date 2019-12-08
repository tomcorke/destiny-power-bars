import { action } from "@storybook/addon-actions";
import React from "react";

import { LoginPrompt } from "./LoginPrompt";

export default {
  title: "Login Prompt"
};

export const display = () => (
  <LoginPrompt onLoginClick={action("login button click")} />
);
