# Light Grid Game

## Summary

`Light Grid` は current grid を target grid と同じ点灯状態に揃えるまでの `clear time` を競う short puzzle game である。

## User Problem

- 短時間で終わる toggle puzzle が catalog に欲しい
- move optimization と speed を同時に意識する board puzzle を 2 分以内で replay したい

## Users and Scenarios

- ユーザは target pattern を見ながら current grid を toggle して一致させる
- move count を抑えつつ clear を狙いたい

## Scope

- target grid と editable grid を同時表示する
- primary metric は `clear time`
- support metric は `Moves`

## Non-Goals

- endless puzzle generation
- solver hint

## User-Visible Behavior

- board には target grid と current grid が並ぶ
- editable cell を tap すると toggle rule に従って state が変わる
- current grid が target grid と一致した瞬間に clear となる

## Acceptance Criteria

- move count が result に表示される
- target と current の差分を同一 screen で確認できる
- each run remains within 2 minutes

## Edge Cases

- clear 後の追加 tap は move count を増やさない
- idle preview board と live board が混同されない

## Constraints and Dependencies

- mobile でも grid tap だけで完結する

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
