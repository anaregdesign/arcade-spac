# Azure Delivery Contract Cleanup

## Summary

`Arcade` の Azure CI/CD と IaC contract から bootstrap-only secret と workflow 側の naming reconstruction を外し、routine release と bootstrap recovery が resource discovery と template-owned runtime contract で動く状態に整理する。

## User Problem

- routine release workflow が GitHub `production` Environment に不要な `SQL_ADMINISTRATOR_LOGIN` と `SQL_ADMINISTRATOR_PASSWORD` を要求している
- workflow と verification helper が `ca-${AZURE_APP_NAME}` や `cae-${AZURE_APP_NAME}`、`AFD Private Link Request` のような duplicated string contract に依存している
- migration identity attachment と startup migration database URL resolution が workflow helper code に散っており、template-owned runtime contract として一元化されていない
- bootstrap と release の contract cleanup で不要になった helper code や docs 参照が repo に残っている

## Users and Scenarios

- maintainer は GitHub `production` Environment から bootstrap-only SQL admin secret を外し、routine release identity をより least-privilege に保ちたい
- operator は workflow が Azure resource type discovery と template outputs / resource state に基づいて動き、resource 名の duplicated string contract を保守したくない
- reviewer は bootstrap / release / verification path から不要な helper code が落ち、repo contract が読みやすくなっていることを期待する

## Scope

- routine release workflow から `SQL_ADMINISTRATOR_LOGIN` と `SQL_ADMINISTRATOR_PASSWORD` を完全に外す
- `infra/main.bicep` を更新し、SQL admin login/password を bootstrap-only input に下げつつ、migration identity attachment と startup migration env contract を template 側へ寄せる
- bootstrap / release / verification helper と workflow から resource 名の manual reconstruction と Front Door private-link description 依存を外す
- cleanup 後に不要になった helper code や docs contract を削除または更新する

## Non-Goals

- Azure SQL bootstrap workflow 自体を廃止すること
- `AZURE_APP_NAME` を repository contract から外すこと
- Azure resource naming convention そのものを redesign すること

## User-Visible Behavior

- GitHub `production` Environment は routine release のために SQL admin login/password secret を保持しない
- routine release workflow は resource group 内の actual Azure resources を discover して infra plan / deploy / app rollout を進める
- bootstrap workflow は SQL bootstrap job を resource discovery で組み立て、固定の resource 名 reconstruction に依存しない
- Container App runtime は template が供給する migration identity と startup migration database URL を使って起動し、workflow helper による都度 injection を必要としない
- docs は routine release と bootstrap recovery の current environment contract を正確に説明する

## Acceptance Criteria

- `.github/workflows/release-container-image.yml` に `SQL_ADMINISTRATOR_LOGIN` と `SQL_ADMINISTRATOR_PASSWORD` の参照が残っていない
- `.github/workflows/bootstrap-azure-recovery.yml` の `ensure_resource_group` から未使用の `AZURE_APP_NAME` requirement が消えている
- release / bootstrap / verification path から `AFD Private Link Request` による filtering と `ca-` / `cae-` / `id-sql-*` / `job-sql-bootstrap-*` の manual reconstruction が除去または局所化されている
- `infra/main.bicep` が migration identity attachment と startup migration env contract を直接表現する
- cleanup 後に未使用になった helper code は repo から削除され、残る script は current contract にだけ従う
- docs が `production` と `production-bootstrap` の必要 variables / secrets を cleanup 後の contract に更新している

## Edge Cases

- bootstrap workflow では create-time Azure SQL server contract のために SQL admin login/password input が残ってもよいが、その surface は `production-bootstrap` に限定する
- resource discovery は target resource group に `Arcade` platform resource が 1 つずつ存在する contract を前提にし、複数検出時は fail fast する
- verification helper は explicit override が渡された場合を優先しつつ、通常 path では resource discovery を使う

## Constraints and Dependencies

- production と shared environment への deploy は引き続き GitHub Workflow 経由のみとする
- bootstrap recovery では broader RBAC を持つ `production-bootstrap` OIDC identity を維持する
- Azure SQL private connectivity と Entra-only auth contract は維持する

## Links

- Related: [./oidc-only-azure-bootstrap-recovery.md](/Users/hiroki/arcade-spec/docs/spec/oidc-only-azure-bootstrap-recovery.md)
- Related: [./platform-delivery-specs.md](/Users/hiroki/arcade-spec/docs/spec/platform-delivery-specs.md)
