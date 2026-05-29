import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './config/env.config';
import { readFileSync } from 'fs';

function getPlaywrightVersion(): string {
  const pkg = JSON.parse(readFileSync(new URL('./node_modules/@playwright/test/package.json', import.meta.url), 'utf8'));
  return pkg.version as string;
}

export default defineConfig({
  testDir: './tests',
  timeout: envConfig.timeout,
  expect: {
    timeout: envConfig.expectTimeout,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: envConfig.retries,
  workers: envConfig.workers,
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        BASE_URL: envConfig.baseUrl,
        ENV: process.env.TEST_ENV === undefined || process.env.TEST_ENV === '' ? 'qa' : process.env.TEST_ENV,
        NODE_VERSION: process.version,
        PLAYWRIGHT_VERSION: getPlaywrightVersion(),
      },
    }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['./reporters/CustomSlackReporter.ts'],
    process.env.CI !== undefined && process.env.CI !== '' ? ['dot'] : ['list'],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: envConfig.baseUrl,
    headless: envConfig.headless,
    launchOptions: { slowMo: envConfig.slowMo },
    actionTimeout: envConfig.actionTimeout,
    navigationTimeout: envConfig.navigationTimeout,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    // Dedicated regression projects — point to tests/regression/ and run serially per file
    {
      name: 'regression-chromium',
      testDir: './tests/regression',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
    },
    {
      name: 'regression-firefox',
      testDir: './tests/regression',
      use: { ...devices['Desktop Firefox'] },
      fullyParallel: false,
    },
    {
      name: 'regression-webkit',
      testDir: './tests/regression',
      use: { ...devices['Desktop Safari'] },
      fullyParallel: false,
    },
    // Dedicated performance project — Chromium only, serial to avoid resource contention
    {
      name: 'performance-chromium',
      testDir: './tests/performance',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
    },
  ],
});
