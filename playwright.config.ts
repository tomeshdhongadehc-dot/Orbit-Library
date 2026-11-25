import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "pnpm exec next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  projects: [
    { name: "phone-375", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 800 } } },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 900 } } },
    { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
});
