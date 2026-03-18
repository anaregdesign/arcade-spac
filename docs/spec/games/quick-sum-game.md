# Quick Sum Game

## Summary

`Quick Sum` は short arithmetic prompt を連続で解き、規定数の problem を終えるまでの `clear time` を競う logic game である。

## User Problem

- 数字入力ではなく、瞬時の mental arithmetic を短く回せる game が欲しい
- puzzle より短く、reflex game より思考が必要な中間帯が欲しい

## Users and Scenarios

- ユーザは画面中央の式を読み、4 択から正答を選ぶ
- wrong answer を記録されても run を続けたい

## Scope

- 連続 arithmetic rounds
- primary metric は `clear time`
- support metric は `Wrong answers`

## Non-Goals

- long-form equation editor
- negative number や decimal の導入

## User-Visible Behavior

- run 中は 1 問ずつ arithmetic prompt が表示される
- answer を選ぶとすぐ次問題に進む
- 規定数の問題を終えると result に進む

## Acceptance Criteria

- answer choice は keyboard なしで完結する
- wrong answer が support metric に残る
- all difficulty levels stay within 2 minutes per run

## Edge Cases

- same answer button の連打で複数問進まない
- idle 中に answer buttons を押しても score は始まらない

## Constraints and Dependencies

- result summary は existing duration formatter を使う

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
