# Color Sweep Game

## Summary

`Arcade` に `Color Sweep` を追加する。board 上で指定された target color の tile だけをすべて tap し、すべて消し切るまでの time を競う short-session perception game とする。

## User Problem

- reflex だけでなく、短時間の視認性と判断速度を使う game が不足している
- 長い puzzle を始めるほどではないが、数十秒で集中して遊べる option が少ない

## Users and Scenarios

- ユーザは home から `Color Sweep` を選び、target color を一目で理解してすぐ board を始めたい
- ユーザは target と異なる tile を避けながら、正しい tile を素早く全部 tap したい
- ユーザは result で clear time と wrong tap 数を見て replay したい

## Scope

- `Color Sweep` を home、workspace、result、rankings、profile に統合する
- `difficulty` ごとに board size、color variety、target tile 数を調整する
- primary metric は `clear time`、support metric は `wrong taps` とする

## Non-Goals

- drag selection や multi-touch selection
- color blindness assist の phase 1 最適化 beyond basic contrast
- combo bonus や score multiplier

## User-Visible Behavior

- idle overlay から run を開始すると、target color chip と tile board が live になる
- ユーザは target color の tile を tap すると正しく消せる
- target 以外を tap すると `wrong taps` が増えるが、そのまま続行できる
- target tile をすべて消すと自動で result へ遷移する
- result、profile、rankings では `clear time` と `wrong taps` を確認できる

## Acceptance Criteria

- `Color Sweep` card が home に表示され、game route を開ける
- touch と mouse の両方で tile selection が完了できる
- run 完了時に `clear time` と `wrong taps` が保存される
- wrong tap があっても board は続行できる
- result screen で primary metric は time 表示、support metric は `wrong taps` 表示になる

## Edge Cases

- run 開始前の tap は board state を変えない
- すでに消した tile は再度 tap しても count されない
- narrow viewport でも board と target color が同一画面で視認できる

## Constraints and Dependencies

- shared workspace card と board overlay pattern を再利用する
- primary metric は existing duration formatter を使う
- save failure 時も `wrong taps` を recovery draft に保持する

## Links

- Related: [../product-specs.md#game-catalog-expansion](../product-specs.md#game-catalog-expansion)
- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
