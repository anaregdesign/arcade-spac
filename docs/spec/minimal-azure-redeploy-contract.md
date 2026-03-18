# Minimal Azure Redeploy Contract

## Summary

`Arcade` の Azure hosting contract を簡素化し、routine redeploy が GitHub Release workflow と GitHub Actions OIDC を中心に完結するようにする。Azure SQL private networking と `Microsoft Entra ID` runtime auth は維持しつつ、App Configuration と Key Vault の update path から manual step 依存を外す。

## User Problem

- 旧 contract では Azure SQL、App Configuration、Key Vault をすべて private networking 前提で持っており、routine redeploy のたびに Azure data-plane reachable host から config sync を行う manual step が必要だった
- `infra/main.bicep` に optional resource path が残っており、hosted production contract と一致しない toggle が release path を複雑にしている
- release workflow は Azure OIDC で infra と app rollout を行えるが、bootstrap / recovery まで含めて workflow-only では閉じていない

## Users and Scenarios

- releaser は local から GitHub Release を publish するだけで、runtime config sync を含む routine redeploy が進むことを期待する
- operator は Azure SQL private path を維持したまま、config store update のためだけに private network host や one-off Azure CLI session を要求されたくない
- maintainer は hosted production contract に不要な IaC toggle や private resource を減らし、repo 内の docs と workflow を一貫した形にしたい

## Scope

- hosted production contract から不要な IaC optional path を削除する
- Azure SQL と migration identity は hosted baseline として `infra/main.bicep` に常設する
- App Configuration と Key Vault は GitHub-hosted workflow から OIDC + Azure RBAC で sync できる access contract に寄せる
- release workflow に runtime config sync を追加し、routine redeploy で local Azure data-plane operation を不要にする
- bootstrap と recovery も GitHub Actions OIDC workflow に寄せ、local Azure bootstrap path を primary contract から外す
- README、prerequisite docs、operations runbook、relevant specs を新しい redeploy contract に合わせて更新する

## Non-Goals

- Azure SQL `Private Endpoint` や `Entra-only` auth の廃止
- production / shared environment への local direct deploy
- Entra app registration audience や sign-in UX の redesign
- bootstrap-only な Microsoft Entra app registration 作成や GitHub Environment 作成の完全自動化

## User-Visible Behavior

- hosted runtime は引き続き Azure SQL private path と `ManagedIdentityCredential` / `DefaultAzureCredential` based auth で起動する
- GitHub Release publish 時には、workflow が OIDC で Azure に login し、runtime config を App Configuration / Key Vault へ同期してから app revision を rollout する
- routine redeploy の runbook は private data-plane reachable host からの manual config sync を要求しない
- worst-case recovery では dedicated bootstrap workflow が resource group 作成と initial SQL bootstrap を OIDC で完了できる
- App Configuration と Key Vault を private endpoint 前提で検証するのではなく、workflow-driven sync と runtime access contract を前提に verification できる

## Acceptance Criteria

- `infra/main.bicep` から hosted baseline と一致しない optional path が削除され、Azure SQL resource path は default hosted contract として常設される
- `infra/main.bicep` から App Configuration / Key Vault private endpoint と related private DNS resources が削除される
- `.github/workflows/release-container-image.yml` に runtime config sync job が追加され、GitHub Actions OIDC 後に App Configuration / Key Vault を更新できる
- bootstrap / recovery 用 workflow が resource group 作成と initial Azure SQL principal bootstrap を OIDC で実行できる
- routine redeploy に必要な GitHub `production` Environment contract が docs に明記され、manual local config sync が routine step から外れる
- verification script と operations docs が、新しい config store access contract と remaining bootstrap responsibilities を説明する

## Edge Cases

- custom domain を使う場合は `PUBLIC_APP_URL` を workflow input contract で override できる
- Entra tenant と Azure deploy tenant が異なる場合でも、runtime config sync に必要な Entra values を GitHub Environment contract で明示できる
- bootstrap-only role assignment や app registration update は残ってよいが、GitHub workflow から実行できる path を優先する

## Constraints and Dependencies

- deploy path は引き続き GitHub Workflow を使い、local session から production Azure resource を直接更新しない
- GitHub OIDC deploy identity には infra rollout に加えて App Configuration / Key Vault sync に必要な Azure data-plane write 権限が必要になる
- bootstrap workflow には resource group 作成、bootstrap RBAC、initial SQL principal bootstrap を完了するための separate OIDC identity が必要になる
- runtime source of truth は deployed app から見た App Configuration と Key Vault に残しつつ、GitHub `production` Environment が redeploy-time input source になる
- `docs/plans/plan.md` で実装を追跡する

## Links

- Related: [./platform-delivery-specs.md](/Users/hiroki/arcade-spec/docs/spec/platform-delivery-specs.md)
- Related: [./operations-specs.md](/Users/hiroki/arcade-spec/docs/spec/operations-specs.md)
- Related: [../azure-prerequisites.md](/Users/hiroki/arcade-spec/docs/azure-prerequisites.md)
