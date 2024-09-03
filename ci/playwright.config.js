const { devices } = require('@playwright/test');

module.exports = {
  webServer: {
    command: ' npm run server', // Start a simple HTTP server to serve your Jasmine runner HTML
    port: 9000,
    reuseExistingServer: false,
  },
  testDir: './',
  testMatch: '**/*.spec.js',
  use: {
    browserName: 'chromium', // or 'firefox' or 'webkit' for other browsers
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};
