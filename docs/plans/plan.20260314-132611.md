# Execution Plan

## Links
- Spec: /docs/spec/repository-governance.md

## Section 1 - Lock TSX Naming Scope
- [x] Confirm which `.tsx` files are component files that must move to `UpperCamel`, and keep route / framework entry exceptions intact.
- [x] Merge the naming rule into the existing repository governance spec instead of creating a new spec file.

## Section 2 - Rename Component Files
- [x] Rename non-route component `.tsx` files under `app/components/` to `UpperCamel`.
- [x] Update every affected import path across routes, components, and supporting modules.

## Section 3 - Verify And Close Out
- [x] Run the repository quality gates that still apply after the rename.
- [x] Archive the completed plan.
- [x] Commit the completed rename as one logical change.
