// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 5 : undefined,
  reporter: [['html', { open: 'never' }], ['list'], ['json', { outputFile: 'test-results.json' }]],
  use: {

    trace: 'on-first-retry',
    screenshot:'only-on-failure',
    baseURL:'https://app.affooh.com'},

  /* Configure projects for major browsers */
  projects: [
   {
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
}

  ],

  
});

