# Execution Plan

## Links
- Spec: `/docs/spec/production-entra-login-recovery.md`

## Section 1 - Diagnose And Isolate Hosted Login Failure
### Subsection 1.1 - Callback Observability
- [x] Split hosted callback failures into token exchange and user sync / database failures
- [x] Log production-safe callback error context so container logs explain the failure path
- [x] Update login error messaging to match the refined callback failure codes

## Section 2 - Restore Release-Time Migration Startup
### Subsection 2.1 - Migration Bootstrap Contract
- [x] Update the startup migration script to prefer a dedicated migration `DATABASE_URL` input before store-backed resolution
- [x] Update the release workflow to derive and pass the migration `DATABASE_URL` to the deployed revision
- [x] Keep the hosted runtime config contract store-backed while scoping the new env var to startup migration use

## Section 3 - Verify And Close
### Subsection 3.1 - Local Verification
- [x] Add or update targeted coverage for the refined auth failure handling where practical
- [x] Run targeted tests, typecheck, and build
- [x] Validate the release workflow shape after the migration contract update
