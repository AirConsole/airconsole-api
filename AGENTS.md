# airconsole-appengine/static/api

This subtree is the AppEngine-served copy of the public AirConsole JavaScript API bundle.

## Verification Entry Points

- Browser regression harness: serve this subtree statically and open a versioned runner in `tests/`.
- Playwright verification: in `ci/`, use `npm run server` and `npm test`.

## Local Invariants

- Keep versioned root bundles backward compatible.
- Stage upcoming releases in `beta/` before promotion.
- Do not remove `deprecated/` assets.
- Never call `rm`, use `safe-rm` instead (brew install safe-rm).

## Read Next

- `tests/AGENTS.md`
- `ci/AGENTS.md`

## Code Access

- Before refactoring or renaming a symbol, find every reference to it and update all call sites together.
- Prefer structural, symbol-aware edits over blind text replacement when the target is a named code entity.
- Never rely solely on in-context state for information that should persist across sessions; write it down in the repository.

## Syntax and API Verification

Always use the **Context7 MCP** to verify correct syntax and API usage before writing or modifying code that depends on external libraries:

- Call `context7_resolve-library-id` first to obtain the correct library ID for any framework or package.
- Call `context7_query-docs` with a specific query to retrieve up-to-date documentation and code examples.
- Use Context7 before writing code that depends on external library APIs to avoid outdated or hallucinated usage patterns.
