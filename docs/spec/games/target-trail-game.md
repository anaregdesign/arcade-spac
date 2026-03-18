# Target Trail Game

## Summary

`Target Trail` は grid 上に 1 つずつ現れる active target を順番に tap し続け、trail を完走するまでの `clear time` を競う chase game である。

## User Problem

- fast-start な reflex game を、単発 precision ではなく連続 input で遊びたい
- `Number Chain` よりも視線移動と瞬間追従を重視した option が欲しい

## Users and Scenarios

- ユーザは active target を見つけてすぐ tap したい
- ユーザは wrong tap を記録されても run を継続したい

## Scope

- one-active-target loop を持つ grid board
- primary metric は `clear time`
- support metric は `Misses`

## Non-Goals

- moving animation を伴う drag interaction
- endless survival mode

## User-Visible Behavior

- run 開始後、board には 1 つだけ active target が表示される
- 正しい target を tap すると次の target が別位置に現れる
- wrong tap は `Misses` を増やすが run は続く
- 規定数の target を完了すると result に進む

## Acceptance Criteria

- user は keyboard なしで target trail を完了できる
- support metric として `Misses` が result に表示される
- すべての難易度で 1 run は 2 分以内に終わる

## Edge Cases

- active target がない idle 中の tap は無視される
- same cell の連打で trail progress が二重に進まない

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
