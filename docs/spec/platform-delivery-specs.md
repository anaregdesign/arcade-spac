# Platform Delivery Specs

## Summary

`Arcade` repository の CI/CD、IaC、provisioning contract を `azure-app-platform-delivery` の best practice に揃え、GitHub release から Azure Container Apps への delivery が predictably かつ least-privilege に運用できる状態へ更新する。

## User Problem

- 現在の release workflow は image publish と app deploy を主に扱っており、`plan_infra` と `deploy_infra` が分離されていない
- 現在の repository には push / pull request 向けの quality gate workflow がなく、workflow や Bicep の regression を release 前に止めにくい
- GitHub `production` Environment contract が `AZURE_CONTAINER_APP_NAME` や GHCR 固有の変数に寄っており、shared skill の generic contract とずれている
- runbook と prerequisite docs が現行 release workflow shape と manual bootstrap responsibility を十分に表現していない
- hardening 後の first push と first release で `Quality Gates` と `Release Azure Delivery` が fail しており、target contract への migration が完了していない

## Users and Scenarios

- リリース担当者は GitHub Release を publish するだけで、immutable image publish、infra plan、必要時のみの infra deploy、app rollout、smoke test が順に進むことを期待する
- repository 管理者は GitHub `production` Environment に必要な variables と secrets を minimal かつ generic な contract で管理したい
- 開発者は push / pull request の段階で typecheck、unit test、build、workflow lint、Bicep validation に失敗した変更を検出したい
- 運用者は runbook と prerequisite docs を見れば、どこまで workflow が担い、どこから先が human bootstrap かを誤解なく判断したい

## Scope

- release workflow を `publish`、`plan_infra`、`deploy_infra`、`deploy_app`、`smoke_test` の job shape に更新する
- `what-if` を使った infra drift 判定を導入し、app-only release では infra rollout を skip できるようにする
- GitHub Environment contract を `AZURE_APP_NAME` と generic registry variables / secrets へ寄せる
- push / pull request 向けの quality gate workflow を追加する
- Azure helper scripts と docs を新しい workflow contract に合わせて更新する
- migrated workflow contract で actual GitHub Actions run が成功するように repository-side mismatch を解消する

## Non-Goals

- production や shared environment への local agent からの直接 deploy
- Azure resource topology の全面 redesign
- game UI、route flow、domain behavior の変更
- GitHub branch protection や `production` Environment approval rule の control-plane 実施

## User-Visible Behavior

- pull request と default branch push では、repository quality gate workflow が code、workflow、IaC の主要 validation を実行する
- GitHub release publish 時には、immutable release tag image が GHCR に publish される
- prerelease 以外の release では、workflow が current deployed image を使って infra `what-if` を実行し、real infra change があるときだけ infra rollout する
- app rollout は infra convergence と分離された job で行われ、Container App revision 更新が explicit に実行される
- smoke test は deploy 済み Container App FQDN に対して `/health` を検証する
- runbook と prerequisite docs には、GitHub `production` Environment の expected variables / secrets、OIDC deploy identity、registry auth、manual config sync responsibility が current contract として記載される
- hardening 変更を含む head commit に対して `Quality Gates` と `Release Azure Delivery` が pass する

## Acceptance Criteria

- `.github/workflows/release-container-image.yml` が `publish`、`plan_infra`、`deploy_infra`、`deploy_app`、`smoke_test` を持つ
- `plan_infra` が `az deployment group what-if` を使い、currently deployed image を `infra/main.bicep` parameter に与えて false-positive infra drift を避ける
- `deploy_infra` が `plan_infra` の結果に応じて conditional に実行される
- `deploy_app` が release tag の immutable image を explicit に Container App へ反映する
- `deploy_app` が registry auth を generic `CONTAINER_REGISTRY_*` contract で扱い、GHCR 固有の variable 名に依存しない
- push / pull request の quality gate workflow が typecheck、unit test、build、Bicep validation、workflow lint を実行する
- `scripts/azure/postprovision.sh` と `scripts/azure/verify-production-runtime.sh` が `AZURE_APP_NAME` based contract と両立する
- `docs/azure-prerequisites.md`、`docs/production-operations.md`、関連 runbook が新しい environment variable / secret contract と release flow を説明する
- hardening 後の push run で `Quality Gates` が success になる
- hardening 後の release run で `Release Azure Delivery` が success になるか、repository-side failure がなくなって external prerequisite のみが残る

## Edge Cases

- Container App resource 名は `ca-${AZURE_APP_NAME}` を default としつつ、明示 override が必要な path は script input で扱える
- GHCR package が public なら registry credentials を要求しない
- private registry path が必要でも、ACR の場合は `CONTAINER_REGISTRY_IDENTITY` を優先し、username / password は fallback としてのみ扱う
- Bicep role assignment を IaC が管理するため、deploy identity が `Contributor` だけでは不足するケースを docs で明記する
- App Configuration / Key Vault data-plane sync は release workflow の責務ではないため、manual bootstrap / rotation path を docs に残す

## Constraints and Dependencies

- deploy path は GitHub Workflow を使い、local session から `azd deploy` や `az containerapp update` で production を更新しない
- GitHub `production` Environment、OIDC federated credential、Azure RBAC、App Configuration / Key Vault data-plane access は repository 外で bootstrap が必要
- workflow lint は repository 側で実行可能な validator を使う
- `infra/main.bicep` は Container App image parameter を引き続き受け取るため、infra plan は current deployed image を使って neutralize する必要がある

## Links

- Related Skill: [../../.github/skills/azure-app-platform-delivery/SKILL.md](../../.github/skills/azure-app-platform-delivery/SKILL.md)
- Related: [./operations-specs.md](./operations-specs.md)
- Related: [../azure-prerequisites.md](../azure-prerequisites.md)
