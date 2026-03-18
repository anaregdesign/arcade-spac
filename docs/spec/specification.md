# Suffix Scoped Azure Environment Isolation

## Summary

`green` / `blue` / `dev` suffix ごとに Azure hosted environment を完全に独立させる。`OIDC` や `Service Principal` などの app 共通 identity は人間が最初に作成したものを使い回しつつ、deploy target ごとの Azure resource 名は suffix を含めて衝突しないようにする。同一 suffix 内の rerun では、その suffix environment に属する active resource や recoverable resource を再利用できる必要がある。

## User Problem

operator は破壊的変更の切り替え先として `green` / `blue` / `dev` を使い分けたいが、現在の naming contract では suffix が変わっても Azure resource 名の多くが共通で、cross-suffix で識別しづらく、global-name resource では collision が起こりうる。さらに同一 suffix の retry では partial resource や soft-deleted resource を再利用できないと recovery 自体が止まる。

## Users And Scenarios

- operator が `Bootstrap Azure Recovery` を `rg-arcade-green` / `rg-arcade-blue` / `rg-arcade-dev` に対して実行する
- operator が destructive change 前に別 suffix environment へ切り替えて rollout する
- operator が同一 suffix environment の bootstrap / recovery を rerun する

## Scope

- infra と workflow の naming contract が suffix-aware になる
- suffix ごとに独立すべき Azure resources が他 suffix と名前衝突しない
- shared identity resource だけは suffix を増やして複製しない
- bootstrap / release / verification / helper scripts が suffix-aware resource name を同じ規則で導出する
- 同一 suffix 内の rerun では active hosted resource を再利用し、recoverable `App Configuration` / `Key Vault` は recover して再利用できる

## Non-Goals

- shared identity を suffix ごとに複製すること
- soft-deleted resource を purge する destructive recovery path を workflow に追加すること
- Azure topology や GitHub Environment contract 全体を別方式へ置き換えること

## User-Visible Behavior

- `green` / `blue` / `dev` で deployment される Azure hosted resources は、resource 名に suffix を含むか、suffix ごとに一意になる naming rule を持つ
- workflow-owned helper script は `Container App`、`Container Apps environment`、`Front Door`、`SQL server`、`App Configuration`、`Key Vault` などの target resource 名を suffix-aware に解決する
- shared `OIDC` / `Service Principal` / app registration などの app 共通 identity は既存の共通 account を使い回す
- bootstrap / release は同一 suffix environment に既存 active resource がある場合、その suffix environment の resource を再利用する
- bootstrap は同一 suffix environment の target `App Configuration` / `Key Vault` が recoverable 状態なら recover してから deployment を続行する

## Acceptance Criteria

- `green` / `blue` / `dev` のいずれを選んでも、environment-scoped Azure resource 名が別 suffix と重複しない
- `Bootstrap Azure Recovery`、`Release Azure Delivery`、`Verify Recovered Runtime` と helper script 群が同じ suffix-aware naming rule を使う
- shared identity contract は suffix を変えても変わらず、bootstrap / release workflow は共通 `OIDC` / `Service Principal` を使い続ける
- latest bootstrap failure と同じ `rg-arcade-dev` partial state を想定しても、workflow contract 上は `existing SQL server` と recoverable `App Configuration` / `Key Vault` を再利用できる
- infra template と workflow parameter flow は existing `SQL server` reuse 時に `AadOnlyAuthenticationIsEnabled` を再発させない
- touched workflow YAML と `infra/main.bicep` は local validation を通る

## Edge Cases

- target resource group に同一 type resource が複数ある場合は曖昧なまま進まず fail fast する
- shared identity resource は suffix を付けずにそのまま使うが、environment-scoped resource は suffix-aware naming にする
- active resource がなく recoverable resource もない場合だけ create path を使う
- `AZURE_GLOBAL_NAME_SUFFIX` と active resource 名が一致しなくても、同一 suffix environment の active resource 実名が優先される
- recover command が permission 不足で失敗した場合は、その resource type と required operator action が分かる形で fail する

## Constraints And Dependencies

- GitHub Actions OIDC と Azure CLI を使う repository policy は維持する
- production/shared environment の deployment は GitHub Workflow 経由のみとする
- shared app identity は既存の人手 bootstrap 済み account を使い回す
- Bootstrap / release / verification helper script と `infra/main.bicep` の naming contract は整合している必要がある
- `App Configuration` / `Key Vault` の global name uniqueness と soft-delete behavior を前提にする

## Links

- Active plan: `/docs/plans/plan.md`
- Related legacy spec: `/docs/spec/production-rg-arcade-green-release-retarget.md`
