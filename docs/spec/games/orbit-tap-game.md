# Orbit Tap Game

## Summary

`Orbit Tap` は circular lane を回る marker が gate と重なる瞬間を狙って連続 hit を決め、規定回数を揃えるまでの `clear time` を競う short-run timing game である。

## User Problem

- reflex 系でも board puzzle とは違う、瞬間精度だけに集中する option が欲しい
- `Precision Drop` とは別の timing expression を 2 分以内で replay したい

## Users and Scenarios

- ユーザは run を開始し、orbit 上を回る marker を見て gate overlap の瞬間に tap したい
- ユーザは連続 hit を決めたあと result に移り、clear time と miss 数を確認したい

## Scope

- circular orbit、moving marker、static gate を 1 screen で表示する
- 1 run の中で複数回 hit する timing loop を持つ
- primary metric は `clear time`
- support metric は `Misses`

## Non-Goals

- 複数 marker
- combo や連続 round
- physics-heavy particle effect

## User-Visible Behavior

- `Start run` で marker が orbit 上を動き始める
- live run 中に gate overlap 付近で tap すると 1 hit が記録され、次の gate へ進む
- gate から外れた tap は `Misses` を増やすが run は続く
- 規定 hit 数に達すると clear となり result に進む
- time limit までに規定 hit 数へ届かなければ `failed` として result に進む

## Acceptance Criteria

- primary metric は `clear time` label で表示される
- gate から外れた tap が `Misses` として result に残る
- `Expert` でも run は 2 分以内に終わる

## Edge Cases

- idle 中の tap は score を変えない
- result 遷移中の追加 tap は無視する

## Constraints and Dependencies

- existing duration formatter と count support metric pattern を再利用する
- run 終了後は existing result route へ自動遷移する

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
