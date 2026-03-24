# Execution Plan

1. Inspect every current `GameplayQuizLayout` consumer and confirm the shared shuffle abstraction can preserve stable choice order across rerenders.
2. Introduce a shared quiz-choice shuffling hook for `GameplayQuizLayout` consumers so quiz-style games do not reimplement per-question ordering.
3. Migrate current layout consumers to the shared hook and remove MCP-specific shuffling logic that no longer needs to live in its workspace controller.
4. Add focused tests for the shared shuffle logic, verify the touched routes, and archive this plan.

## Completion Notes

- Added a shared `useShuffledQuizChoices` hook plus pure helper functions so `GameplayQuizLayout` consumers can keep a stable shuffled key order across rerenders.
- Migrated `McpPrimer` to the shared hook and removed the MCP-specific choice shuffling implementation from its workspace controller.
- Updated `quiz-layout-preview` to use the same shared hook, so the layout preview and MCP now share one quiz-choice shuffling path.
- Added focused tests for the shared shuffle helpers and passed `npm run test:unit -- app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts app/lib/client/usecase/game-workspace/game-utils.test.ts app/lib/client/usecase/game-workspace/use-shuffled-quiz-choices.test.ts`.
- Browser-verified `http://localhost:5174/quiz-layout-preview` and confirmed the single-select preview rendered in a non-source order (`A/C/B` during verification), showing the shared hook is active for layout consumers.
