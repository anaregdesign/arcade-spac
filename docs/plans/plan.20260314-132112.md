# Execution Plan

## Links
- Spec: /docs/spec/ui-specs.md

## Section 1 - Lock Browser Adapter Scope
- [x] Confirm every direct browser integration that currently lives outside `app/lib/client/infrastructure/browser/`.
- [x] Keep the browser-adapter ownership rule merged into the existing UI spec instead of creating a new spec file.

## Section 2 - Extract Browser Infrastructure
- [x] Add browser infrastructure modules for scheduler access, scroll access, keyboard subscription, document theme updates, and browser-native form payload creation.
- [x] Move browser sound playback ownership under `app/lib/client/infrastructure/browser/`.

## Section 3 - Rewire Client Use Cases
- [x] Update Home and Profile use cases to consume browser adapters instead of direct browser globals.
- [x] Update game workspace session and submission use cases to consume browser adapters instead of direct browser globals.
- [x] Remove direct browser-global access from `app/lib/client/usecase/` and `app/lib/client/`.

## Section 4 - Verify And Close Out
- [x] Run targeted tests for touched deterministic helpers.
- [x] Run the repository quality gates that still apply after the refactor.
- [x] Archive the completed plan.
