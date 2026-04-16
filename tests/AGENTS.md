# airconsole-appengine/static/api/tests

This subtree owns the browser-based Jasmine regression harness for the AppEngine-served API bundle copy.

## Local Focus

- versioned HTML spec runners
- shared Jasmine libraries in `lib/`
- JS assertions in `spec/`

## Local Invariants

- Keep version-specific specs aligned with the copied bundle behavior in this static subtree.
- Prefer extending existing spec files and shared helpers over inventing new runner patterns.
- Do not remove old spec runners unless the supported API version contract changes intentionally.

## Verification Entry Points

- From `../ci`, run `npm run server`, then load the target versioned runner under `/tests/`.
- Keep manual runner expectations aligned with the Playwright checks in `../ci/`.
