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

## Memory Management

Always use the **Kratos MCP** to manage memory across sessions:

- Store relevant context, decisions, and learnings via `kratos_memory_save` before ending a session.
- Retrieve prior context at the start of a new session using `kratos_memory_search` or `kratos_memory_get_recent`.
- Use `kratos_memory_ask` for natural language queries against accumulated memory.
- Never rely solely on in-context state for information that should persist across sessions.

## Code Access

Always use the **Serena MCP** for reading and writing code:

- Use `serena_find_symbol`, `serena_get_symbols_overview`, and `serena_search_for_pattern` to navigate and understand code.
- Use `serena_find_referencing_symbols` to find all callers/references before refactoring, and `serena_rename_symbol` to rename a symbol consistently across the codebase.
- Use `serena_replace_symbol_body`, `serena_replace_content`, `serena_insert_after_symbol`, and `serena_insert_before_symbol` to make code changes.
- Prefer symbol-level tools over raw text replacement when the target is a named code entity.
- Always call `serena_check_onboarding_performed` after activating a project.

## Syntax and API Verification

Always use the **Context7 MCP** to verify correct syntax and API usage before writing or modifying code that depends on external libraries:

- Call `context7_resolve-library-id` first to obtain the correct library ID for any framework or package.
- Call `context7_query-docs` with a specific query to retrieve up-to-date documentation and code examples.
- Use Context7 before writing code that depends on external library APIs to avoid outdated or hallucinated usage patterns.
