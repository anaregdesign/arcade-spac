# Execution Plan

Relevant specs:
- `/docs/spec/feature-specs.md`

1. Audit the current `MCP Primer` study pages and quiz items against the public MCP docs, then lock a section-by-section study/quiz progression that keeps each question answerable from nearby study content.
2. Expand and correct the `MCP Primer` study content and any inaccurate or ambiguous quiz wording across `en`/`ja`/`zh`/`fr`, with explicit source attribution preserved on every study and quiz step.
3. Refactor the `MCP Primer` workspace flow from one study block plus one quiz block into alternating study and quiz sections without changing result tracking.
4. Add focused tests for the new sectioned flow and content invariants, verify the touched workspace in the browser, and archive this plan.

## Completion Notes

- Re-checked the weak spots against the current public MCP architecture, tools, resources, prompts, and transport documentation before editing the lesson content.
- Expanded `MCP Primer` from 4 study pages to 6 source-backed study pages so the lesson now covers client-side primitives, initialization identity exchange, tool definition fields, tool error handling, resource annotations, prompt arguments, and prompt message structure.
- Added a reusable section map in the content layer and changed the workspace controller so each study section flows directly into its own quiz section before unlocking the next topic.
- Updated localized study pages for `ja`, `zh`, and `fr` to keep the same coverage and preserve MCP canonical terms.
- Added section and coverage invariants to `app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts`, passed the focused MCP Primer unit test, and passed `npm run typecheck`.
- Browser-verified `http://localhost:5173/games/mcp-primer` by progressing through section 1 study, section 1 questions, and confirming the run returned to section 2 study with the new architecture-focused content and source attribution visible.
