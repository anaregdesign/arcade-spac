# Symbol Hunt Game

## Summary

`Symbol Hunt` は board 上に散らばる symbol の中から target symbol だけを見つけて tap し、全 target を取り切るまでの `clear time` を競う perception game である。

## User Problem

- `Color Sweep` と違い、色ではなく shape / mark の識別を使う game が欲しい
- 視覚ノイズの中から target を素早く見つける練習先が欲しい

## Users and Scenarios

- ユーザは target symbol を見て board を探索する
- wrong tap を受けても run を継続したい

## Scope

- symbol grid board
- primary metric は `clear time`
- support metric は `Wrong taps`

## Non-Goals

- drag selection
- zoom や pan

## User-Visible Behavior

- run 中は target symbol が header と board で確認できる
- 正しい symbol を tap すると board から消える
- wrong tap は count される
- 全 target を消すと result に進む

## Acceptance Criteria

- target symbol は run 中ずっと参照できる
- target 以外の tap は `Wrong taps` に加算される
- run は 2 分以内で完了する

## Edge Cases

- cleared cell の再 tap は count を増やさない
- idle 中の board tap は state を変えない

## Constraints and Dependencies

- `Color Sweep` と同じ board-clear pattern を応用する

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
