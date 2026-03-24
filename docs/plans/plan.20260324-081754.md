# Execution Plan

## References

- [docs/spec/ui-specs.md](/Users/hiroki/arcade-spec/docs/spec/ui-specs.md)

## Section 1: Quiz source attribution

- [x] Extend the shared quiz gameplay layout API so prompts can declare public-document sources without changing answer-card usage.
- [x] Render source attribution in the prompt area with a readable label, title, optional note, and external link treatment that works on desktop and mobile.
- [x] Update the development preview and render coverage to exercise the source attribution path.
- [x] Run targeted verification for the touched quiz layout files.

## Notes

- Added a `sources` prop to the shared quiz layout so future study pages and prompt-driven quiz screens can show public-document attribution without a separate wrapper.
- Verified with `npm run test:unit -- app/lib/client/ui/gameplay-quiz-layout-render.test.ts`, `npm run typecheck`, and browser preview at `/quiz-layout-preview`.
