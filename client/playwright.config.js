// client/playwright.config.js
// Playwright E2E test configuration for FitMart

import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Look for test files in the e2e/ directory
  testDir: "./e2e",
  testMatch: "*.spec.js",

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 1 : 0,

  // Limit workers to avoid overwhelming the dev server
  workers: process.env.CI ? 2 : 1,

  // Timeout per test
  timeout: 45_000,

  // Reporter
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: process.env.CI ? "never" : "on-failure" }],
  ],

  use: {
    // Run with Chromium
    browserName: "chromium",

    // Capture screenshot and trace on failure
    screenshot: "only-on-failure",
    trace: "on-first-retry",

    // Ignore HTTPS errors for local dev
    ignoreHTTPSErrors: true,
  },

  // Optionally start the Vite dev server before tests
  // Uncomment the block below if you want the tests to start the dev server automatically.
  // Requires the dev server to be configured and available.
  //
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:5173",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 30_000,
  // },
});
