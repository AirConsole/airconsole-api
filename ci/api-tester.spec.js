const { test, expect } = require('@playwright/test');

// Jasmine 2.5.2 specs (1.6–1.10) render .jasmine-duration when done;
// Jasmine 4.6.1 spec (1.11.0) renders .jasmine-overall-result.
const SPECS = [
  { file: "airconsole-1.6.0-spec.html",  doneSelector: '.jasmine-duration' },
  { file: "airconsole-1.7.0-spec.html",  doneSelector: '.jasmine-duration' },
  { file: "airconsole-1.8.0-spec.html",  doneSelector: '.jasmine-duration' },
  { file: "airconsole-1.9.0-spec.html",  doneSelector: '.jasmine-duration' },
  { file: "airconsole-1.10.0-spec.html", doneSelector: '.jasmine-duration' },
  { file: "airconsole-1.11.0-spec.html", doneSelector: '.jasmine-overall-result' },
];

SPECS.forEach(({ file, doneSelector }) => {
  test(`Run Jasmine on ${file}`, async ({ page }) => {
    await page.goto(`http://localhost:9000/tests/${file}`);

    // Wait for Jasmine to finish
    await page.waitForSelector(doneSelector, { timeout: 60000 });

    // Collect failure details for readable output
    const failures = await page.evaluate(() => {
      return [...document.querySelectorAll('.jasmine-spec-detail.jasmine-failed')].map(el => ({
        name: el.querySelector('.jasmine-description')?.textContent.trim(),
        message: el.querySelector('.jasmine-result-message')?.textContent.trim(),
        stack: el.querySelector('.jasmine-stack-trace')?.textContent.trim().split('\n').slice(0, 6).join('\n'),
      }));
    });

    if (failures.length > 0) {
      const report = failures.map((f, i) =>
        `\n[${i+1}] ${f.name}\n    ${f.message}\n${f.stack}`
      ).join('\n');
      console.log(`\nFailed tests in ${file}:${report}`);
    }

    expect(failures.length).toBe(0);
  });
});
