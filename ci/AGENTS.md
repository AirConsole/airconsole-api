# airconsole-appengine/static/api/ci

This subtree owns the Playwright-based verification harness for the AppEngine-served API bundle copy.

## Local Commands

- Start static server: `npm run server`
- Run Playwright checks: `npm test`

## Local Invariants

- The CI harness serves the static API bundle root on port `9000`; keep Playwright config and server assumptions aligned.
- Prefer extending `api-tester.spec.js` and `playwright.config.js` instead of adding parallel test runners.
- Treat `jenkins.groovy` as CI contract glue, not general app logic.
