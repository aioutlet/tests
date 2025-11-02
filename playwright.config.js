import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for AIOutlet E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test timeout for each assertion
  expect: {
    timeout: 5000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.WEB_UI_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Show browser window during test execution (not headless)
    headless: false,

    // Launch browser in fullscreen/maximized mode and disable automation bar
    launchOptions: {
      args: ['--start-maximized', '--start-fullscreen'],
    },

    // Use full screen viewport - set to null to use browser's full size
    viewport: null,

    // Slow down operations to see what's happening (in milliseconds)
    // Uncomment to slow down test execution
    // slowMo: 500,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        // Don't use devices preset to avoid viewport override
        channel: 'chrome',
        // Keep the viewport and launch settings from global use config
      },
    },

    // Uncomment to test in other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Test against mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run your local dev server before starting the tests
  // Uncomment if you want Playwright to start the web-ui automatically
  webServer: {
    command: 'cd ../ui/web-ui && npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
