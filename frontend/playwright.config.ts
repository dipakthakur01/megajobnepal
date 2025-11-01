import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'npm run dev -- --port 3003',
    url: 'http://localhost:3003',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  globalSetup: require.resolve('./tests/global-setup.ts'),
});