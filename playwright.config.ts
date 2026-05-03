import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests — see https://playwright.dev/docs/test-configuration
 *
 * Run: `sh run test:e2e` (starts Next if needed, or reuses an existing dev server locally).
 * UI mode: `sh run test:e2e:ui`
 *
 * Optional env:
 * - PLAYWRIGHT_BASE_URL — override default http://localhost:3000
 * - PLAYWRIGHT_SKIP_WEBSERVER=1 — do not spawn `yarn dev` (you already run the app)
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const parsedBaseURL = new URL(baseURL);
const webServerHost = parsedBaseURL.hostname;
const webServerPort =
  parsedBaseURL.port || (parsedBaseURL.protocol === "https:" ? "443" : "80");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer:
    process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1"
      ? undefined
      : {
          command: `yarn dev --webpack --hostname ${webServerHost} --port ${webServerPort}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
});
