# Execution Plan

## Links
- Spec: /docs/spec/repository-governance.md#repository-rename-and-integration-retargeting
- Runbook: /docs/repository-rename-runbook.md

## Section 1 - Record Post-Rename Audit Findings
- [x] Update the repository rename spec with the newly verified post-rename remediation scope.
- [x] Update the repository rename runbook with verified GitHub, workflow, and Azure findings.

## Section 2 - Repair External Identity Binding
- [x] Update the Azure deploy federated credential subject from the old repository slug to `repo:anaregdesign/arcade-spec:environment:production`.
- [x] Verify the federated credential now reports the new repository slug.

## Section 3 - Close Out The Remediation Slice
- [x] Mark the plan complete and archive it once documentation and Azure verification are finished.
- [x] Prepare the repository documentation updates as a coherent commit unit.
