// vitest.config.js
// Separate from vite.config.js — configures JSX via esbuild automatic runtime
// so neither test files nor source files need `import React from "react"`.
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  },
});
