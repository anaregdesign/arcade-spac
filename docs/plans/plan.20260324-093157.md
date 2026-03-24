# Execution Plan

## References

- [docs/spec/product-specs.md](/Users/hiroki/arcade-spec/docs/spec/product-specs.md)
- [docs/spec/feature-specs.md](/Users/hiroki/arcade-spec/docs/spec/feature-specs.md)

## Section 1: Quiz localization policy and MCP Primer coverage

- [x] Add a durable quiz-localization requirement covering multilingual copy and untranslated technical terms.
- [x] Localize `MCP Primer` study pages, quiz prompts, explanations, source notes, and phase-specific UI copy for supported locales.
- [x] Verify `MCP Primer` content invariants and affected gameplay UI behavior.

## Notes

- Verification notes:
	- `npm run test:unit -- app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts`
	- Browser check on `/games/mcp-primer` with locale switched to `ja` confirmed localized study copy while canonical MCP terms such as `MCP`, `tools`, and `USB-C port for AI applications` remained unchanged