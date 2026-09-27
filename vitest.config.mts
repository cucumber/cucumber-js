import { cucumber } from "@cucumber/cucumber/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [cucumber({ paths: ["features/core.feature"] })],
  test: {
    coverage: {
      reportsDirectory: ".vitest-coverage",
    },
  },
});
