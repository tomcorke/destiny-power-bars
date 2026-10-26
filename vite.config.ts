/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";
import Info from "unplugin-info/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(), Info(), basicSsl()],
  envDir: "./",
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/data/d2ai-module/**",
        "src/**/*.stories.tsx",
        "src/**/*.test.{ts,tsx}",
      ],
      // Raised automatically when coverage improves; never lower these.
      thresholdAutoUpdate: true,
      lines: 8.81,
      functions: 9.7,
      branches: 29.71,
      statements: 8.81,
    },
  },
});
