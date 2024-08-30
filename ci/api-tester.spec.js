const { test, expect } = require('@playwright/test');

[
  // Older version do not work for some reason...
  "airconsole-1.6.0-spec.html",
  "airconsole-1.7.0-spec.html",
  "airconsole-1.8.0-spec.html",
  "airconsole-1.9.0-spec.html",
].forEach((t) => {
  test(`Run Jasmine on ${t}`, async ({ page }) => {
    // Load the Jasmine runner HTML page
    await page.goto(`http://localhost:9000/tests/${t}`); // Adjust the URL if needed

    // Wait for the tests to complete
    await page.waitForSelector('.jasmine-passed'); // Adjust this selector based on Jasmine's final output

    // Check for any failed tests
    const failedTests = await page.$$('.jasmine-failed');
    expect(failedTests.length).toBe(0); // Ensure there are no failed tests
  });

})

