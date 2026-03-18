# Pulse Count Game

## Summary

`Pulse Count` は pulsing signal の flash 回数を数え、watch phase 後に正しい count を選ぶ round-based memory / perception game である。

## User Problem

- 画面全体の動きではなく、短い flash 回数だけを数える軽量 game が欲しい
- 数秒単位の round を複数回まとめて replay できる option が欲しい

## Users and Scenarios

- ユーザは signal の pulse 回数を数える
- round ごとに 4 択から count を選ぶ
- wrong answer があっても run 全体は継続したい

## Scope

- watch pulse + answer choice の round を複数回行う
- primary metric は `clear time`
- support metric は `Wrong answers`

## Non-Goals

- free-text answer input
- audio-only counting mode

## User-Visible Behavior

- run 開始で pulse animation が再生される
- watch 後に choice buttons が有効化される
- 正答で次 round へ進み、全 round 完了で result に進む
- 誤答は `Wrong answers` を増やして次 round へ進む

## Acceptance Criteria

- answer choice は touch と mouse の両方で選べる
- watch 中に answer buttons は無効化される
- 1 run は 2 分以内に収まる

## Edge Cases

- round transition 中の多重 tap は 1 回だけ扱う
- wrong answer 後に同 round へ戻らず flow が止まらない

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
