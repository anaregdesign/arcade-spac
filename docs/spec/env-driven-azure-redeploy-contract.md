# Environment-Driven Azure Redeploy Contract

## Summary

`Arcade` の Azure redeploy contract を、dev phase の repeated destroy/recreate と resource-group switch を前提に整理し、GitHub Environment が持つ `AZURE_APP_NAME` を single source of truth として workflow と IaC の primary source of truth に寄せる。

## User Problem

- dev phase では resource group を作り直しながら何度も redeploy するため、resource discovery 前提の workflow は intent が読みにくく失敗点も増えやすい
- `AZURE_APP_NAME` があるのに、workflow と Bicep が deploy target をそこから一貫して導出しておらず、contract が二重化している
- current bootstrap / release path は empty resource group や別 resource group への切り替え時に、deterministic name contract より discovery の複雑さが勝っている

## Users and Scenarios

- operator は `AZURE_RESOURCE_GROUP` を別の値に切り替えても、GitHub Environment の variables / secrets だけで bootstrap workflow と release workflow を回したい
- maintainer は `AZURE_APP_NAME` だけを operator-owned contract とし、Container App 名は `ca-${AZURE_APP_NAME}` で自明に決まる状態を保ちたい

## Scope

- GitHub Environment の `AZURE_APP_NAME` を single source of truth に戻す
- `infra/main.bicep` は Container App resource 名を `ca-${appName}` で内部導出する
- bootstrap / release / verify workflow は `AZURE_APP_NAME` から deterministic に Container App target を導く
- workflow-owned helper scripts も `AZURE_APP_NAME` を explicit contract として扱い、resource-group scoped fallback discovery を減らす
- resource recreation に必要な retry / lookup を `ca-${AZURE_APP_NAME}` 起点に簡素化する
- docs を新しい env-driven contract に更新する

## Non-Goals

- globally unique なすべての Azure resource 名を GitHub Environment variable にすること
- Azure SQL create-time password requirement を未検証のまま削除すること
- production/shared deploy policy を local Azure CLI path に戻すこと

## User-Visible Behavior

- operator は GitHub Environment の `AZURE_RESOURCE_GROUP` と `AZURE_APP_NAME` を更新するだけで、別 resource group への bootstrap / redeploy contract を揃えられる
- bootstrap / release workflow は Container App resource を `ca-${AZURE_APP_NAME}` で特定し、必要な managed environment lookup だけをそこから行う
- empty resource group や recreated resource group に対しても、workflow の target resource contract が deterministic で読みやすい

## Acceptance Criteria

- `.github/workflows/bootstrap-azure-recovery.yml`、`.github/workflows/release-container-image.yml`、`.github/workflows/verify-production-runtime.yml` が `AZURE_APP_NAME` を required env contract として使う
- `infra/main.bicep` が Container App resource 名を public param ではなく `appName` から内部導出する
- private-link approval や app rollout は、single-resource discovery ではなく `ca-${AZURE_APP_NAME}` 起点で target resource を扱う
- workflow-owned helper scripts が `AZURE_APP_NAME` を required input として扱う
- docs が `AZURE_APP_NAME` を current GitHub Environment contract として説明する
- `az bicep build`、workflow YAML parse、typecheck / script checks が通る

## Edge Cases

- `AZURE_APP_NAME` が未設定なら workflow は fail fast する
- managed environment 名のような pure derived value は env var 必須にせず、container app resource から lookup してよい
- globally unique resource 名は env var ではなく template derivation を維持してよい

## Constraints and Dependencies

- deploy path は引き続き GitHub Workflow 経由のみとする
- GitHub Environment variables / secrets の更新は repo 外の operator task として残る
- day-to-day release と bootstrap recovery の権限分離は維持する

## Links

- Related: [./azure-delivery-contract-cleanup.md](/Users/hiroki/arcade-spec/docs/spec/azure-delivery-contract-cleanup.md)
- Related: [./platform-delivery-specs.md](/Users/hiroki/arcade-spec/docs/spec/platform-delivery-specs.md)
