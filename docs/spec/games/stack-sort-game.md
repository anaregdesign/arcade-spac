# Stack Sort Game

## Summary

`Stack Sort` は colored stack の top token を別 stack へ移し、各 stack を single-color に揃えるまでの `clear time` を競う compact logic game である。

## User Problem

- 移動回数の最適化を考える classic sorting puzzle を短い run で replay したい
- grid puzzle とは違う vertical board manipulation が欲しい

## Users and Scenarios

- ユーザは source stack を選び、destination stack を選んで token を移す
- 不正 move が無視されても run は継続したい

## Scope

- small stack sorting board
- primary metric は `clear time`
- support metric は `Moves`

## Non-Goals

- more than one token per move
- hint solver

## User-Visible Behavior

- stack を 1 本選ぶと top token が active になる
- 次に destination stack を選ぶと legal move のときだけ token が移る
- 全 non-empty stack が single-color になれば clear となる

## Acceptance Criteria

- invalid move は board を壊さずに無視される
- move count が result に表示される
- すべての難易度で 2 分以内に終わる

## Edge Cases

- empty stack を source にしても state は変わらない
- full stack への move は無効化される

## Constraints and Dependencies

- touch だけで source / destination selection が完結する

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
