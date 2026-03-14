# Execution Plan

## Links
- Spec: /docs/spec/feature-specs.md#sound-effects

## Section 1 - Spec and Shared Sound Module
- [x] Remove "audio cue や sound effect" from pattern-echo-game.md Non-Goals
- [x] Add Sound Effects section to feature-specs.md
- [x] Create `app/lib/client/sound-effects.ts` with Web Audio API synthesized sound functions

## Section 2 - Integrate Sounds Into Each Game Workspace
- [x] pattern-echo-game-workspace.tsx — padFlash, tapCorrect/Wrong, runStart/Clear/Fail
- [x] pair-flip-game-workspace.tsx — cardFlip, cardMatch/Mismatch, runStart/Clear/Fail
- [x] color-sweep-game-workspace.tsx — tapCorrect/Wrong, runStart/Clear/Fail
- [x] minesweeper-game-workspace.tsx — cellReveal, mineExplode, flagOn/Off, runStart/Clear
- [x] number-chain-game-workspace.tsx — tapCorrect/Wrong, runStart/Clear/Fail
- [x] sudoku-game-workspace.tsx — tapCorrect/Wrong, hintUse, runStart/Clear
- [x] precision-drop-game-workspace.tsx — ballDrop, runStart/Clear/Fail

## Section 3 - Verify
- [x] TypeScript type-check passes — no errors in client-side files
