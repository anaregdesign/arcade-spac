# Path Recall Game

## Summary

`Path Recall` は short watch phase で示された path を記憶し、その順番どおりに grid cell を再入力して clear を目指す memory / logic game である。

## User Problem

- `Pattern Echo` より spatial memory 寄りの recall game が欲しい
- sequence ではなく path の連なりを覚える遊び方を短時間で繰り返したい

## Users and Scenarios

- ユーザは watch phase で highlighted path を目で追う
- その後、同じ cell order を tap して path を再現する

## Scope

- watch phase と input phase を持つ grid-based memory game
- primary metric は `clear time`
- support metric は `Wrong cells`

## Non-Goals

- free drawing
- diagonal-free edit mode のカスタム設定

## User-Visible Behavior

- watch phase では path cell が順番に強調表示される
- input phase では user が同じ順に cell を tap する
- wrong cell は count されるが run は続行できる
- path 完了で result に進む

## Acceptance Criteria

- watch 中は board input が progress を進めない
- path 完了時に clear time と wrong cell count が保存される
- すべての難易度で 2 分以内に終わる

## Edge Cases

- watch 直後の連打で 2 step 以上進まない
- run 開始前の tap は board state を変えない

## Constraints and Dependencies

- `Pattern Echo` と同じフェーズ分離 pattern を踏襲する
- support metric は `mistakeCount` に保存する

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
