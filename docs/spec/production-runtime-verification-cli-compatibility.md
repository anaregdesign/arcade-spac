# Production Runtime Verification CLI Compatibility

## Summary

`Arcade` の scheduled production verification と release 前確認が、Azure CLI や resource provider の default API version 変化に引きずられず、healthy な production runtime を false negative で fail させない状態へ更新する。

## User Problem

- scheduled の `Verify Production Runtime` workflow が、production runtime 自体は healthy でも verification script 内の Azure resource query 互換性問題で fail している
- release 担当者は app や infra の regression ではなく verification tooling の drift で CI が赤くなると、release readiness を判断しづらい
- この状態のまま push や release を進めると、実際の production 問題と verification tooling 問題の切り分けがしにくい

## Users and Scenarios

- 運用者は scheduled verification が production contract の逸脱だけを検知し、CLI 実装差分で false fail しないことを期待する
- リリース担当者は main を push した後に GitHub Release を publish しても、production verification 系 workflow が安定して通ることを必要とする

## Scope

- `scripts/azure/verify-production-runtime.sh` の Azure resource query を、Azure CLI default API version drift に耐える形へ更新する
- 必要な verification を local で実施し、push 前に repo 側 regression を確認する
- 修正を main へ push し、GitHub Workflow ベースの release path で新しい release を publish する

## Non-Goals

- Azure resource topology の変更
- game UI、route、domain behavior の変更
- local session からの production 直接 deploy

## User-Visible Behavior

- scheduled `Verify Production Runtime` は、healthy な production contract に対して resource query 互換性問題で false fail しない
- releaser は main への push 後、GitHub Release を publish する既存 delivery path を継続利用できる
- release readiness の判断材料として、verification workflow の fail が production contract の逸脱を反映する状態になる

## Acceptance Criteria

- Key Vault と App Configuration の verification query が、Azure CLI default API version drift に依存せずに実行できる
- local verification で対象 script 変更の妥当性を確認できる
- 修正 commit を push 後、対象 branch の quality gate が success になる
- 新しい GitHub Release を publish し、`Release Azure Delivery` workflow が起動する

## Edge Cases

- production resource が 1 件でも query contract だけが壊れている場合は、resource health ではなく verification script を修正対象として扱う
- future の Azure CLI 更新でも再度同種の false fail を起こしにくい query contract を優先する

## Constraints and Dependencies

- deploy path は GitHub Workflow を使い、local agent から production 直接 deploy は行わない
- Azure verification の一部確認には、Azure subscription への read access と current production resource group access が必要

## Links

- Related: [./platform-delivery-specs.md](./platform-delivery-specs.md)
- Related: [./operations-specs.md#production-recovery-and-redeploy](./operations-specs.md#production-recovery-and-redeploy)
- Plan: [../plans/plan.20260314-154549.md](../plans/plan.20260314-154549.md)
