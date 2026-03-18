# Cascade Flip

## Summary

`Arcade` に `Cascade Flip` を追加する。brief reveal で覚えた card order を moving stream の中から順番に flip し、board motion と memory pressure を同時に処理する dynamic memory game とする。

## User Problem

- `Pair Flip` や `Sequence Point` は static board memory が中心で、moving-board memory pressure が不足している
- memory game に視線追跡と timing の要素を追加して catalog の多様性を広げたい

## Users and Scenarios

- 利用者は Home から `Cascade Flip` を開き、brief reveal で order を覚えた後、moving stream から正しい card を探したい
- 利用者は current target order、resolved cards、misses を見ながら stream を追いたい
- 利用者は Result、profile、rankings で `clear time` と `misses` を確認したい

## Scope

- `Cascade Flip` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `misses` とする
- workspace では reveal state、current target index、moving card stream、miss count を live 表示する

## Non-Goals

- static pair matching board
- endless card fountain
- free pause-and-review mode

## User-Visible Behavior

- idle overlay から run を開始すると、target order が短時間だけ reveal され、その後 board は moving stream state に切り替わる
- cards は lane 内を落下または段階移動し、target order に対応する card を correct sequence で flip する必要がある
- correct flip は current target index を進め、resolved count を増やす
- wrong flip や off-order selection は `misses` を増やし、stream は止まらない
- 規定 resolved count に達すると clear となり Result に遷移する
- timer が切れた場合は fail として Result に遷移する

## Acceptance Criteria

- `Cascade Flip` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または fail が確定する
- reveal phase と moving stream phase の 2 段が明確に分かれている
- workspace 上で current target、resolved count、misses、stream speed が更新される
- Result、profile、rankings では `clear time` と `misses` が保存される

## Edge Cases

- reveal 中の flip input は state を変えない
- same card への duplicate flip が sequence を壊さない形で扱われる
- moving stream pattern は deterministic verification が可能な bounded setである
- narrow viewport でも lane と current target cue が見切れず readable である

## Constraints and Dependencies

- board motion は速すぎず、memory pressure と touch safety を両立する

## Distinction

- `Pair Flip` の static memory ではなく、moving-board memory pressure が主題
- `Icon Chain` の clue inference ではなく、stream 上の correct sequence tracking が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
