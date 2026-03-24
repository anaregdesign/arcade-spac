# Execution Plan

## Links
- Spec: /docs/spec/ui-specs.md

## Section 1 - Quiz shared layout foundation
### Subsection 1.1 - Spec and placement
- [x] Capture the quiz shared layout requirement in the durable UI spec
- [x] Define the canonical placement for the shared quiz gameplay components

### Subsection 1.2 - Shared quiz components
- [x] Add a gameplay-scoped Markdown renderer for quiz prompt and choice content
- [x] Add a reusable quiz layout component that supports single-select and multi-select choice presentation
- [x] Keep the new quiz layout aligned with existing gameplay cards, cues, and choice-grid patterns

### Subsection 1.3 - Verification
- [x] Add targeted verification for markdown rendering and quiz layout behavior
- [x] Run typecheck for the touched files
- [x] Verify the rendered layout in the browser with a safe preview surface

### Subsection 1.4 - Notes
- Placement preflight:
  - app/components/gameplay/quiz/GameplayQuizMarkdown.tsx
  - app/components/gameplay/quiz/GameplayQuizMarkdown.module.css
  - app/components/gameplay/quiz/GameplayQuizLayout.tsx
  - app/components/gameplay/quiz/GameplayQuizLayout.module.css
  - optional: app/routes/quiz-layout-preview.tsx for verification only if needed
- Verification notes:
  - npm run test:unit -- app/lib/client/ui/gameplay-quiz-layout-render.test.ts
  - npm run typecheck
  - Browser check on /quiz-layout-preview in local dev server
