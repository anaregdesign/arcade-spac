# Result Screen Share Action Labels

## Summary

`Result` 画面の共有アクション表記を英語に統一し、意味が十分固定されている補助アクションはアイコンだけで表現する。

## User Problem

- `Result` 画面の主要導線は英語中心だが、共有アクションだけ日本語が残っていて表記が揃っていない
- 補助アクションまで文字量が多く、score-first な画面で視線が散りやすい

## Users and Scenarios

- ユーザは run 完了後に、結果確認の流れを言語の切り替わりなくたどりたい
- ユーザはランキング確認やホーム復帰のような定番導線を、長い文言を読まずに押したい
- ユーザは Teams 共有先を誤解せずに共有を実行したい

## Scope

- `Result` 画面の共有アクション表記を英語に統一する
- 意味が十分固定された補助アクションをアイコンボタンへ置き換える
- アイコンボタンでもアクセシビリティ上の名称は維持する

## Non-Goals

- 共有先の追加や share URL の変更
- `Result` 画面以外の action label の一括見直し
- rankings や home の遷移仕様変更

## User-Visible Behavior

- owner 表示時の Teams 共有アクションは英語ラベルで表示される
- rankings と home の補助アクションは、視覚上はアイコンだけで判別できる
- replay のように文脈依存で意味を補った方がよい主要アクションはテキストを維持する
- lock 状態の Teams 共有でも、英語ラベルのまま利用不可と分かる

## Acceptance Criteria

- `Result` 画面に日本語の共有ボタン文言が残らない
- `Result` 画面の rankings 導線がアイコンのみで表示される
- `Result` 画面の home 導線がアイコンのみで表示される
- アイコンのみの導線でも、支援技術向けの名称が失われない

## Edge Cases

- Teams 共有が lock 状態でも action strip の並びが崩れない
- narrow screen でも icon-only action が過密にならず押せる

## Constraints and Dependencies

- 既存の action-link スタイルを大きく崩さず、結果画面の score-first hierarchy を維持する
- 共有先が Teams であることは視覚的または accessible name で判別できるようにする

## Links

- Related: [result-screen-score-focus.md](./result-screen-score-focus.md)
- Plan: [../plans/plan.20260313-221400.md](../plans/plan.20260313-221400.md)
