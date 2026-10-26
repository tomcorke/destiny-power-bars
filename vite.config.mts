import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import svgrPlugin from "vite-plugin-svgr";
import Info from "unplugin-info/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgrPlugin(), Info(), basicSsl()],
  resolve: { tsconfigPaths: true },
  envDir: "./",
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/data/d2ai-module/**",
        "src/**/*.stories.tsx",
        "src/**/*.test.{ts,tsx}",
      ],
      // Raised automatically when coverage improves; never lower these.
      thresholds: {
        autoUpdate: true,
        lines: 14.57,
        functions: 7.41,
        branches: 4.77,
        statements: 14.39,
      },
    },
  },
});
