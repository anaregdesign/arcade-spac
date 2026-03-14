# Spec Document Ideal State Only

## Summary

`docs/spec/` 配下の specification は、変更履歴や temporary execution state を含めず、常に現在の理想状態だけを記述する。

## User Problem

- 一部の spec に temporary execution artifact への link や一時的な delivery state への言及が残っている
- 一部の spec が work-log 前提の文言を含み、理想状態の requirement と process 情報が混在している
- spec ごとに記述粒度が揃っていないため、どこまでが durable requirement でどこからが一時的な作業情報かを判断しにくい

## Users and Scenarios

- 開発者は `docs/spec/` を開いたとき、実装時点の作業ログではなく current requirement だけを読みたい
- レビュアーは spec を見れば target behavior と acceptance criteria だけを判断できる状態を必要とする
- 次の担当者は一時的な execution record を別途参照しなくても、spec 本文から current ideal state を誤解なく追いたい

## Scope

- `docs/spec/` 配下の既存 spec から temporary execution artifact への link と一時的な delivery state の言及を取り除く
- work-log 的な process 文言を current ideal state の requirement へ書き換える
- Related doc への link は残しつつ、spec 本文は durable requirement だけを表す形に揃える

## Non-Goals

- historical delivery record 自体の削除や書き換え
- product behavior や Azure / auth / UI requirement そのものの変更
- `docs/spec/` 以外の documentation structure の全面再編

## User-Visible Behavior

- `docs/spec/` の各 specification は、change history や temporary execution state を含まず、current ideal state だけを記述する
- spec の Links section は temporary execution artifact ではなく、関連する durable document への参照だけを持つ
- spec の Acceptance Criteria と Constraints は、作業中の process ではなく完成後に成立しているべき条件を表す

## Acceptance Criteria

- `docs/spec/` 配下の spec に temporary execution artifact への link が残らない
- `docs/spec/` 配下の spec に一時的な execution state を requirement として書いた文言が残らない
- `docs/spec/` 配下の spec に work-log 前提の durable でない記述が残らない
- spec の本文だけを読めば、各 document の target behavior と acceptance criteria を current ideal state として解釈できる

## Edge Cases

- Related document への link は、durable requirement の理解に必要な範囲で残してよい
- current problem を説明するための現状記述は残してよいが、implementation history と混在させない
- runbook や operations doc への参照は残してよいが、spec 自体を temporary delivery note の置き場にしない

## Constraints and Dependencies

- `docs/spec/` の document structure は `spec-driven-workflow` の guidance に従う
- execution sequencing や completed work の record は git と `docs/plans/` に残し、`docs/spec/` には残さない
- spec 間の cross-link は切らさず、current ideal state を読む導線は維持する

## Links

- Related: [game-spec-document-organization.md](./game-spec-document-organization.md)
- Guidance: [../../.github/skills/spec-driven-workflow/references/spec-documentation.md](../../.github/skills/spec-driven-workflow/references/spec-documentation.md)
