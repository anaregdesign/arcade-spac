# Execution Plan

1. Review all 20 MCP Primer quiz questions for ja, zh, and fr to identify terminology drift, punctuation inconsistency, and awkward phrasing.
2. Normalize Japanese and Chinese question stems, explanations, and distractors so each locale uses a consistent quiz tone while preserving MCP canonical terms.
3. Restore French accents and unify French question structure, explanations, and distractors across all 20 questions.
4. Validate the localized content with the MCP Primer content test, then archive this plan.

## Completion Notes

- Normalized Japanese quiz wording around primitive terminology, error phrasing, and transport wording so the 20-question set reads more consistently.
- Normalized Chinese quiz wording around primitive terminology, specification references, error phrasing, and request/session wording across the 20-question set.
- Reworked the full French 20-question block to restore accents and unify prompts, explanations, and distractor phrasing while preserving MCP canonical terms.
- Passed `npm run test:unit -- app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts`.
