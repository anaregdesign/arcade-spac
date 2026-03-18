# OIDC-Only Azure Bootstrap Recovery

## Summary

`Arcade` の Azure bootstrap と full recovery を GitHub Actions OIDC の workflow 経由に統一し、resource group 作成、infra bootstrap、初期 Azure SQL principal 作成まで manual Azure CLI 実行へ依存しない contract に更新する。

## User Problem

- current repository contract では routine redeploy は GitHub Actions OIDC 中心で進められるが、resource group 作成と初期 Azure SQL principal 作成は manual step に残っている
- manual 実行用の script と runbook が残っているため、production recovery path が workflow-only で閉じていない
- deploy identity と SQL bootstrap path が分断されており、最初の hosted baseline を GitHub workflow だけで再作成できない

## Users and Scenarios

- operator は GitHub workflow を起動するだけで、Azure resource group から hosted baseline、初期 SQL user / role bootstrap まで復旧したい
- maintainer は production bootstrap と routine release の両方を OIDC workflow に寄せ、manual Azure操作を docs と repo contract から外したい

## Scope

- OIDC-only の bootstrap / recovery workflow を追加する
- resource group 作成を GitHub OIDC bootstrap identity に移す
- Azure SQL initial principal / role bootstrap を Azure 内で走る workflow-owned execution path に移す
- routine release workflow から external SQL Entra admin input 依存を外せる部分を整理する
- manual 実行前提の script entrypoint、manual、spec を削除または workflow-only contract に置き換える

## Non-Goals

- end-user Microsoft Entra sign-in contract の redesign
- Azure Front Door、Azure SQL private networking、App Configuration、Key Vault を廃止すること
- production deploy を local session から直接行う path を残すこと

## User-Visible Behavior

- operator は GitHub の bootstrap workflow を起動すれば、resource group が無い状態から hosted Azure baseline を作り直せる
- bootstrap workflow は Azure SQL private path を維持したまま、initial database principal / role bootstrap を GitHub OIDC 経由で完了できる
- routine release workflow は bootstrap 完了後に従来どおり release publish で回せる
- repo 内の docs は local Azure CLI bootstrap を primary path として説明しない

## Acceptance Criteria

- GitHub Actions OIDC で resource group 作成から infra bootstrap まで進める workflow が追加されている
- initial Azure SQL principal / role bootstrap が local shell ではなく workflow-owned Azure execution path で完了できる
- routine release workflow から `SQL_ENTRA_ADMIN_*` の external input 依存が削減または削除されている
- manual 実行用 `npm` script entrypoint と bootstrap / recovery runbook が削除または更新されている
- README と Azure docs が workflow-only bootstrap path を current contract として説明している

## Constraints and Dependencies

- day-to-day release identity より bootstrap identity の権限が広くなる場合は、GitHub Environment を分けて standing privilege を分離する
- Azure SQL bootstrap は private networking を維持しつつ、Azure 内 execution path で行う
- App Configuration と Key Vault は引き続き runtime source of truth のまま維持する

## Links

- Related: [./platform-delivery-specs.md](/Users/hiroki/arcade-spec/docs/spec/platform-delivery-specs.md)
- Related: [./operations-specs.md](/Users/hiroki/arcade-spec/docs/spec/operations-specs.md)
- Related: [./minimal-azure-redeploy-contract.md](/Users/hiroki/arcade-spec/docs/spec/minimal-azure-redeploy-contract.md)
