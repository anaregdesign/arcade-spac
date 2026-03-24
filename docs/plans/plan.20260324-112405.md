# Execution Plan

1. Inspect where MCP Primer quiz choices are materialized so shuffling happens once per question without breaking answer validation or review state.
2. Implement per-question choice shuffling in the MCP Primer workspace flow so every question appears in a randomized order each time it is shown.
3. Add or update targeted tests for the shuffle behavior and run the focused MCP Primer unit tests.
4. Archive this plan after verification completes.

## Completion Notes

- Added per-question choice shuffling in the MCP Primer workspace state so each question gets a randomized choice order while answer validation still uses stable choice keys.
- Updated the MCP Primer workspace component to render the shuffled choice order from the use case instead of relying on source-order content.
- Added a focused shuffle utility test and passed `npm run test:unit -- app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts app/lib/client/usecase/game-workspace/game-utils.test.ts`.
- Browser-verified the MCP Primer quiz on `http://localhost:5174/games/mcp-primer` and confirmed question 1 displayed in a non-source order (`D/B/A/C` during verification), showing that shuffling is active.
