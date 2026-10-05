# airconsole-appengine/static/api/ci

This subtree owns the Playwright-based verification harness for the AppEngine-served API bundle copy.

## Local Commands

- Install dependencies: `corepack enable && pnpm install --frozen-lockfile`
- Start static server: `npm run server`
- Run Playwright checks: `npm test`

## Local Invariants

- The CI harness serves the static API bundle root on port `9000`; keep Playwright config and server assumptions aligned.
- Prefer extending `api-tester.spec.js` and `playwright.config.js` instead of adding parallel test runners.
- `.github/workflows/test-api.yml` is the CI entry. The Jenkins job "Test AirConsole API" is being retired.
- Treat `jenkins.groovy` as CI contract glue, not general app logic.
