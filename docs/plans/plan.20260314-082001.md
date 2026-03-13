# Production Recovery Plan

## Section 1: Incident Capture

- [x] Record the SQL network drift symptom and confirmed root cause in the active plan and spec.

## Section 2: Repository Safeguards

### Subsection 2.1: Production Verification Automation

- [x] Add a production verification script that checks the Azure SQL network contract and live application smoke path.
- [x] Add a GitHub Actions workflow that runs the production verification through the `production` GitHub Environment with Azure OIDC.

### Subsection 2.2: Operational Documentation

- [x] Update the production operations documentation with the SQL public network requirement and the new verification path.

## Section 3: Live Recovery

### Subsection 3.1: Azure Drift Correction

- [x] Restore the Azure SQL server network policy to the repository's current public-endpoint contract.

### Subsection 3.2: Production Verification

- [x] Verify `/health` returns success after the drift correction.
- [x] Verify the hosted smoke test passes against the live production URL.

## Section 4: Cleanup

- [x] Archive this execution plan after all checks are complete.
