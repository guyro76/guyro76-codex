import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  timeout: 25_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://127.0.0.1:3210',
    storageState: './e2e/storage-state.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } }
  ],
  webServer: {
    command: 'npm run start -- -p 3210',
    url: 'http://127.0.0.1:3210',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI
  },
  reporter: [['list']]
});
