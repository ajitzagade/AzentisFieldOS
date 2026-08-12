import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: "./",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
