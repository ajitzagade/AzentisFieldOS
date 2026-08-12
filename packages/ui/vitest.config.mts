import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: "./",
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
