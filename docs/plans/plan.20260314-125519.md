# Execution Plan

## Links
- Spec: /docs/spec/component-view-layer-refactor.md

## Section 1 - Establish View-Only Boundaries
- [x] Write the refactor spec for view-only components and create the active execution plan.
- [x] Audit current `app/components` hotspots and decide the target `app/lib/client/usecase` ownership for each screen and workspace.

## Section 2 - Refactor Shared Screens And Shell
### Subsection 2.1 - Shared shell and dialogs
- [x] Move `AppShell` interaction logic into a dedicated client usecase entry under canonical layout.
- [x] Move `GameInstructionsDialog` interaction state into a dedicated client usecase entry.

### Subsection 2.2 - Screen view models
- [x] Refactor Home screen props so `HomeDashboard` receives view-ready data from `app/lib/client/usecase/home-hub`.
- [x] Refactor Profile, Rankings, Result, and Login screens so derived screen logic lives under `app/lib/client/usecase/<feature>/`.

## Section 3 - Refactor Game Workspace Components
### Subsection 3.1 - Shared workspace orchestration
- [x] Extract reusable workspace-side orchestration helpers needed across multiple games into `app/lib/client/usecase/game-workspace`.

### Subsection 3.2 - Game-specific workspace hooks
- [x] Move `Color Sweep`, `Pattern Echo`, `Number Chain`, and `Pair Flip` workspace logic into `app/lib/client/usecase/game-workspace`.
- [x] Move `Minesweeper`, `Precision Drop`, and `Sudoku` workspace logic into `app/lib/client/usecase/game-workspace`.

## Section 4 - Verify And Close Out
- [x] Run targeted verification for the touched screens and workspace flows (`pnpm -s typecheck`, `pnpm -s build`; `eslint` command is not available in this repository).
- [x] Update the active plan to fully checked and archive it with a timestamp.
