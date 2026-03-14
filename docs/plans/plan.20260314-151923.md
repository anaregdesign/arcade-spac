# Plan

## Section 1. Component Placement Preflight

- [x] Confirm the target path for every moved or newly extracted component file.
- [x] Confirm which existing top-level components stay feature-local versus move into `shared`.

### Subsection 1.1 Planned Target Paths

- [x] Move `app/components/AppShell.tsx` to `app/components/shared/AppShell.tsx`.
- [x] Move `app/components/HomeDashboard.tsx` to `app/components/home/HomeDashboard.tsx`.
- [x] Move `app/components/HomeDashboard.module.css` to `app/components/home/HomeDashboard.module.css`.
- [x] Move `app/components/LoginScreen.tsx` to `app/components/login/LoginScreen.tsx`.
- [x] Move `app/components/LoginScreen.module.css` to `app/components/login/LoginScreen.module.css`.
- [x] Move `app/components/ProfileScreen.tsx` to `app/components/profile/ProfileScreen.tsx`.
- [x] Move `app/components/ProfileScreen.module.css` to `app/components/profile/ProfileScreen.module.css`.
- [x] Move `app/components/RankingsScreen.tsx` to `app/components/rankings/RankingsScreen.tsx`.
- [x] Move `app/components/RankingsScreen.module.css` to `app/components/rankings/RankingsScreen.module.css`.
- [x] Add `app/components/shared/SummaryCard.tsx` if the repeated summary-card markup remains shared after review.

## Section 2. Component Refactor

- [x] Relocate the top-level screen components into their feature directories and fix local relative imports.
- [x] Move `AppShell` into `shared` and update all route imports.
- [x] Extract the shared summary-card presentational component only where it reduces real duplication.

## Section 3. Verification

- [x] Verify the touched routes still render with the new component paths.
- [x] Run the production build.

## Section 4. Wrap Up

- [x] Archive this plan to a timestamped file after all work is complete.
- [ ] Create a coherent commit for the refactor.