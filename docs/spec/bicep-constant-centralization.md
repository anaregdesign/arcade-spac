# Bicep Constant Centralization

## Summary

`infra/main.bicep` に散っている hardcoded resource 名や fixed contract string を先頭の `var` 群へ集約し、Azure topology の behavior を変えずに maintainability を上げる。

## User Problem

- `infra/main.bicep` に resource 名、fixed string、role/principal type、route pattern などの literal が散在していて、変更点と deploy contract を追いにくい
- 同じ kind の名前や string literal が複数箇所に現れるため、Bicep を読むときにどれが canonical constant なのか判断しづらい
- infra contract を見直すときに、先頭の naming/constant block だけ見れば把握できる状態になっていない

## Users and Scenarios

- maintainer は `infra/main.bicep` を読むとき、resource 名や fixed contract string を先頭の `var` block でまとめて確認したい
- maintainer は naming や contract string を変えるとき、resource 定義の本文を追い回さずに変更箇所を把握したい

## Scope

- `infra/main.bicep` の hardcoded resource 名や fixed contract string を先頭の `var` 群へ整理する
- `var` 群を意味ごとの group に並べ替える
- 各 `var` が何を表すかを短い comment で示す
- 既存 resource topology、resource type、parameter contract、output contract は維持する
- 重複して使う literal や deploy contract 上の意味を持つ literal を優先して集約する

## Non-Goals

- Azure topology の redesign
- resource 名の naming convention 自体の変更
- workflow や app runtime behavior の変更
- すべての数値や boolean literal を機械的に `var` 化すること

## User-Visible Behavior

- `infra/main.bicep` の先頭を見るだけで、主要 resource 名、Front Door contract string、SQL contract string、role assignment contract string を確認できる
- `infra/main.bicep` の `var` block は naming、Front Door、Container App、Azure SQL などの単位で group 化されている
- 各 `var` の直前 comment を読むと、その constant がどの deploy contract を指すのか判断できる
- 実際の Azure deploy behavior と outputs は従来どおり維持される

## Acceptance Criteria

- `infra/main.bicep` の resource 名と major fixed string が先頭の `var` 群で定義されている
- `infra/main.bicep` の `var` 群が意味ごとに group 化されている
- 各 `var` に、その constant の役割を示す短い comment が付いている
- resource 本文に残る literal は、Bicep syntax 上その場に置くほうが自然なものか、single-use で意味の薄いものに限られている
- 既存 parameter と output の contract は壊れていない
- `az bicep build --file infra/main.bicep` が成功する

## Edge Cases

- single-use でも deploy contract 上の意味が強い literal は `var` に寄せてよい
- 可読性を落とすほど細かい literal 分解は行わない

## Constraints and Dependencies

- この repository の Azure deploy path は GitHub Workflow を維持する
- 今回の変更は IaC の整理であり、runtime behavior を変えないことを優先する

## Links

- Related: [./oidc-only-azure-bootstrap-recovery.md](/Users/hiroki/arcade-spec/docs/spec/oidc-only-azure-bootstrap-recovery.md)
- Related: [./platform-delivery-specs.md](/Users/hiroki/arcade-spec/docs/spec/platform-delivery-specs.md)
