# Execution Plan

1. Tighten the durable quiz-localization requirement so only MCP canonical terms and method names remain untranslated in localized prose.
2. Rewrite MCP Primer UI copy for ja, zh, and fr to remove unnecessary English leftovers while preserving canonical MCP terms.
3. Rewrite MCP Primer localized study pages, explanations, and quiz choices for ja, zh, and fr with natural phrasing and the narrower canonical-term rule.
4. Validate with targeted tests and browser review across non-English locales, then archive this plan.

## Completion Notes

- Narrowed the durable spec rule in `product-specs.md` and `feature-specs.md` so only MCP canonical terms remain untranslated.
- Reworked `copy.ts` and `content-translations.ts` for ja, zh, and fr to reduce unnecessary English in quiz and study prose.
- Passed `npm run test:unit -- app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts`.
- Browser-reviewed MCP Primer on `ja`, `zh`, and `fr` via the local dev server and confirmed the updated localized study/quiz wording renders correctly while preserving canonical MCP terms.