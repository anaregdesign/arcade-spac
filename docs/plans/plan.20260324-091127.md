# Execution Plan

## References

- [docs/spec/ui-specs.md](/Users/hiroki/arcade-spec/docs/spec/ui-specs.md)

## Section 1: Gameplay component placement cleanup

- [x] Move gameplay layout components into `app/components/gameplay/layouts/` and shared non-layout helpers into `app/components/gameplay/shared/`.
- [x] Update imports across previews, tests, and game workspaces to match the new structure.
- [x] Run targeted tests and typecheck to confirm the refactor is behavior-neutral.

## Notes

- Placement preflight:
	- move `app/components/gameplay/quiz/GameplayQuizLayout.tsx` to `app/components/gameplay/layouts/GameplayQuizLayout.tsx`
	- move `app/components/gameplay/quiz/GameplayQuizLayout.module.css` to `app/components/gameplay/layouts/GameplayQuizLayout.module.css`
	- move `app/components/gameplay/learning/GameplayStudyLayout.tsx` to `app/components/gameplay/layouts/GameplayStudyLayout.tsx`
	- move `app/components/gameplay/learning/GameplayStudyLayout.module.css` to `app/components/gameplay/layouts/GameplayStudyLayout.module.css`
	- move `app/components/gameplay/quiz/GameplayQuizMarkdown.tsx` to `app/components/gameplay/shared/GameplayMarkdown.tsx`
	- move `app/components/gameplay/quiz/GameplayQuizMarkdown.module.css` to `app/components/gameplay/shared/GameplayMarkdown.module.css`
	- move `app/components/gameplay/source/GameplaySourceAttribution.tsx` to `app/components/gameplay/shared/GameplaySourceAttribution.tsx`
	- move `app/components/gameplay/source/GameplaySourceAttribution.module.css` to `app/components/gameplay/shared/GameplaySourceAttribution.module.css`
- Verification notes:
	- `npm run typecheck`
	- `npm run test:unit -- app/lib/client/usecase/game-workspace/mcp-primer/content.test.ts app/lib/domain/entities/game-catalog.test.ts app/lib/client/ui/gameplay-study-layout-render.test.ts app/lib/client/ui/gameplay-quiz-layout-render.test.ts`
	- Browser check on `/quiz-layout-preview`