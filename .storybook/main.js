const path = require("path");

module.exports = {
  addons: ["@storybook/preset-scss"],
  babel: async (options) => ({
    // Update your babel configuration here
    ...options,
  }),
  framework: "@storybook/react",
  stories: ["../src/**/*.stories.@(tsx|jsx)"],
  webpackFinal: async (config, { configType }) => {
    // Make whatever fine-grained changes you need
    // Return the altered config
    const fileLoaderRule = config.module.rules.find(
      (rule) => !Array.isArray(rule.test) && rule.test.test(".svg")
    );
    fileLoaderRule.exclude = /\.svg$/;
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack", "url-loader"],
    });

    console.log(config.module.rules);

    // const assetRule = config.module.rules.find(({ test }) => test.test(".svg"));
    // const assetLoader = {
    //   loader: assetRule.loader,
    //   options: assetRule.options || assetRule.query,
    // };
    // config.module.rules.unshift({
    //   test: /\.svg$/,
    //   use: ["@svgr/webpack", assetLoader],
    // });

    return config;
  },
  core: {
    builder: "webpack5",
  },
};
