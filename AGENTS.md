# airconsole-api

## OVERVIEW

- Static public AirConsole JavaScript API bundle.
- Versioned bundle family, current line is 1.10.0 plus variants.
- Served as plain browser JavaScript.
- Consumers load a fixed API version.
- Backward compatibility is enforced by versioned copies.
- Old games and store integrations must keep working.
- Regression coverage uses the Jasmine browser harness.
- CI drives that harness through Playwright.
- Treat this subtree as published API surface.
- Small edits can have long-lived compatibility cost.
- No per-feature behavior notes here.

## STRUCTURE

- `airconsole-X.Y.Z.js` contains versioned root bundles.
- `airconsole-1.10.0.js` is the current main bundle.
- `deprecated/` keeps older released API files.
- `beta/` holds experimental or pre-release API files.
- `tests/` owns regression assets.
- `tests/jasmine/` owns the manual Jasmine browser harness.
- `tests/spec/` and nearby JSON fixtures hold regression cases.
- `ci/` owns Playwright runner wiring when present.
- Generated docs and external developer docs are not source of truth.
- Preserve existing runner layout unless version policy changes.

## VERSION STRATEGY

- Strict semver.
- Backward-compatible fixes may stay on the current version line.
- Backward-incompatible changes require a version increment.
- Always increment for backward-incompatible changes.
- Never mutate old behavior in place for a breaking change.
- Copy forward, change the new version, leave old versions intact.
- `deprecated/` preserves old APIs for existing consumers.
- Deprecated does not mean deleted.
- Active and deprecated APIs stay separated.
- Version isolation is a contract.

## WHERE TO LOOK

- Main bundle: `airconsole-1.10.0.js`.
- Current versioned family: root `airconsole-X.Y.Z.js` files.
- Tests: `tests/jasmine/`.
- Regression JSON tests: `tests/`.
- Regression runner: local static server on port 9000.
- Deprecated APIs: `deprecated/`.
- Experimental APIs: `beta/`.
- Browser runner details: `tests/AGENTS.md`.
- CI runner details: `ci/AGENTS.md` if present.
- Root compatibility note: workspace `AGENTS.md`.

## ENTRY POINT

- Public entry point is global `AirConsole()` constructor.
- Constructor lives on the browser global object.
- Use constructor and prototype pattern.
- Do not rewrite public API shape as classes.
- Public methods hang from the versioned bundle behavior.
- Backward compatibility comes from versioned copies.
- Consumers expect old constructors to behave exactly as before.
- New versions may add behavior without changing old files.
- Avoid hidden cross-version coupling.
- Keep bundle behavior self-contained.

## FORBIDDEN

- NO hardcoding controller device IDs.
- NO edits to removed API folder.
- Removed API folder is off-limits.
- NEVER break backward compatibility without a version bump.
- Do not delete files from `deprecated/`.
- Do not collapse beta, deprecated, and active APIs together.
- Do not replace the public constructor with module-only exports.
- Do not add test-only behavior to production bundles.
- Do not assume only current store users exist.
- Do not bypass regression tests for API behavior changes.

## TEST HARNESS

- Jasmine browser suite is the primary regression harness.
- Playwright drives the browser suite in CI.
- `npm test` starts or runs the harness on port 9000.
- Manual browser harness lives in `tests/jasmine/`.
- Regression JSON tests live under `tests/`.
- Keep versioned runners aligned with bundle behavior.
- Add regression coverage before changing public behavior.
- Prefer extending existing specs and fixtures.
- Keep manual and CI expectations aligned.
- Port 9000 is the expected local runner port.

## CONVENTIONS

- Constructor/prototype pattern, not classes.
- Static bundle, browser-first assumptions.
- Strict version isolation.
- Deprecated APIs stay separate from active APIs.
- Beta APIs stay separate from released APIs.
- Public behavior changes need visible version intent.
- Small compatibility shims are better than consumer breakage.
- Keep tests close to versioned behavior.
- Prefer explicit fixtures over implicit browser state.
- Keep this guide telegraphic.

## COMMANDS

- `npm test`: run Jasmine harness through the port 9000 runner.
- `npm run version`: bundle versioning flow.
- If commands live in a nested runner package, run them there.
- Use the narrowest relevant validation for touched files.
- Stop after the first successful relevant verification.

## NOTES

- Backward compatibility is non-negotiable.
- Released games may pin old AirConsole versions indefinitely.
- Version mismatch with store-v3 is tracked in root `AGENTS.md`.
- Known mismatch: store-v3 has 1.0.24 while workspace uses `workspace:*`.
- Keep this file high-level.
- No per-function details.
