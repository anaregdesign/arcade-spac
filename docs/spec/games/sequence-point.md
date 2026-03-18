# Sequence Point

## Summary

`Arcade` に `Sequence Point` を追加する。短く点灯する point location sequence を round ごとに記憶し、長さが伸びる sprint を最後まで再入力する working memory game とする。

## User Problem

- `Path Recall` よりも短い flash と high-tempo progression で working memory を試したい
- path shape の追跡ではなく abstract point sequence の順序だけに集中する memory game がほしい

## Users and Scenarios

- 利用者は Home から `Sequence Point` を開き、watch phase で点灯 sequence を短時間で覚えたい
- 利用者は input phase で同じ point を同じ順序で tap して round を進めたい
- 利用者は Result で `clear time` と `mistakes` を見て replay したい

## Scope

- `Sequence Point` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `mistakes` とする
- round success ごとに sequence length を伸ばし、target length に達した sprint を clear 条件にする

## Non-Goals

- drag path tracing
- color melody memory
- endless survival mode

## User-Visible Behavior

- idle overlay から run を開始すると、watch phase が始まり point sequence が短時間ずつ点灯する
- watch phase が終わると input phase に切り替わり、利用者は同じ point を同じ順序で tap する
- correct input で round が進み、次 round は sequence length が 1 つ伸びる
- wrong input は `mistakes` に加算されるが run は継続する
- target round まで完了すると自動で Result へ遷移する
- Result、profile、rankings では `clear time` と `mistakes` を確認できる

## Acceptance Criteria

- `Sequence Point` card が Home に表示され、game route を開ける
- 2 分以内に複数 round が進行し、clear または timeout が確定する
- `Path Recall` より短い flashes と high-tempo progression を持つ
- touch と mouse の両方で input phase を完了できる
- run 完了時に `clear time` と `mistakes` が保存される

## Edge Cases

- run 開始前の tap は board state を変えない
- watch phase 中の tap は input progress を進めない
- already completed round の state が次 round へ漏れない

## Constraints and Dependencies

- primary metric は existing duration formatter を使う
- save failure 時も `mistakes` を recovery draft に保持する

## Distinction

- fixed path tracing ではなく abstract point sequence の伸長が core

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
