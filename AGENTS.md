# AirConsole JavaScript API Guidelines

## Scope

This repository contains the public AirConsole browser API bundles. AppEngine
checks it out as a submodule and serves it through the `static/api` symlink.

Read the nearest child guide before changing the browser regression harness in
`tests/` or the Playwright harness in `ci/`.

## Compatibility rules

- Treat the released `airconsole-<version>.js` files as public, versioned APIs.
  Preserve backward compatibility unless the task explicitly changes a supported
  version contract.
- Stage the next release in `beta/`; do not overwrite the current released bundle
  as part of unrelated work.
- Keep `deprecated/` bundles and old versioned test runners. Existing games may
  still depend on them.
- Update `CHANGELOG.md`, version-specific specs, documentation workflow inputs,
  and every internal reference together when promoting or renaming a bundle.
- Preserve the browser compatibility and coding style of the bundle being edited.
  Do not add a new build system or dependency for a focused API change.

## Verification

- Extend the matching Jasmine spec and open its versioned HTML runner under
  `tests/` using a static server.
- From `ci/`, run `npm test`. Playwright starts the port 9000 static server through
  `playwright.config.js`; `npm run server` is available for manual runner checks.
- Verify both the changed API behavior and compatibility with unchanged public
  methods. A generated documentation build does not replace browser regression
  coverage.
