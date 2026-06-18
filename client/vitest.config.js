import { defineConfig } from "vitest/config";

// Standalone Vitest config.
// Not sharing vite.config.js to avoid @vitejs/plugin-react's
// dependency on vite/internal which vite 7.x does not export.
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
