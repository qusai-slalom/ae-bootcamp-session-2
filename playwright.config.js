const { defineConfig, devices } = require('@playwright/test');

// The frontend dev server proxies /api to port 3030 (see packages/frontend/package.json).
const BACKEND_PORT = process.env.BACKEND_PORT || 3030;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start:backend',
      url: `http://localhost:${BACKEND_PORT}`,
      env: { PORT: String(BACKEND_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:frontend',
      url: `http://localhost:${FRONTEND_PORT}`,
      env: { PORT: String(FRONTEND_PORT), BROWSER: 'none' },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
