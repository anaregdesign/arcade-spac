# Tile Shift Game

## Summary

`Tile Shift` は row / column を 1 step ずつ cyclic shift し、scrambled board を target pattern に合わせるまでの `clear time` を競う spatial puzzle game である。

## User Problem

- toggle とは違う spatial manipulation puzzle を短時間で遊びたい
- 盤面全体の並び替えを考える game が欲しい

## Users and Scenarios

- ユーザは target pattern を見て、row / column shift control を押して board を整える
- move count を意識しながら最短で揃えたい

## Scope

- target board と live board
- row / column shift controls
- primary metric は `clear time`
- support metric は `Moves`

## Non-Goals

- arbitrary drag-and-drop
- undo history

## User-Visible Behavior

- row / column control を押すたびに該当 line が 1 step shift する
- live board が target board と一致すると clear する
- move count が support metric として保存される

## Acceptance Criteria

- touch device でも row / column control が first-class action として使える
- target board と live board の差分が視認できる
- run は 2 分以内で終わる

## Edge Cases

- clear 後に control を押しても board は変わらない
- invalid line index が UI から発生しない

## Constraints and Dependencies

- support metric は internal `mistakeCount` を `Moves` として使う
- shared status chip と finish card pattern を再利用する

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
