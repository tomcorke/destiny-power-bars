const path = require("path");

module.exports = {
  addons: ["@storybook/preset-scss"],
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(tsx|jsx)"],
};
