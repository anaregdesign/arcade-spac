# Execution Plan

## References

- [docs/spec/product-specs.md](/Users/hiroki/arcade-spec/docs/spec/product-specs.md)

## Section 1: Learning genre for MCP quiz

- [x] Add `Learning` to the Home game tag taxonomy and visible filter labels.
- [x] Apply the new tag to `MCP Primer` so the quiz appears under the learning filter.
- [x] Run targeted verification for catalog metadata and affected home-tag behavior.

## Notes

- Verification notes:
	- `npm run test:unit -- app/lib/domain/entities/game-catalog.test.ts`
	- Browser check on `/home?tag=learning` confirmed the `Learning` filter option and `MCP Primer` visibility