# Spot Change

## Summary

`Arcade` に `Spot Change` を追加する。`original` と `changed` の 2 scene を見比べ、差分が入った tile を時間内に見つけて tap していく short-session comparison game とする。

## User Problem

- catalog に pure search ではなく before/after comparison を主題にした game がない
- `Hidden Find` のような単一 target search とは別に、複数 scene を比較しながら差分を判断する集中 play がほしい

## Users and Scenarios

- 利用者は Home から `Spot Change` を開き、同じ構図の 2 board をすぐ比較したい
- 利用者は changed scene 側を tap して差分 tile を当て、連続 round をテンポ良く進めたい
- 利用者は Result で `clear time` と `misses` を見て replay したい

## Scope

- `Spot Change` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `misses` とする
- round が進むごとに board size、difference count、distractor variation を増やす

## Non-Goals

- long-form hidden object adventure
- pinch zoom や freehand marking
- animation-only difference に依存した recognition

## User-Visible Behavior

- idle overlay から run を開始すると、`original` と `changed` の 2 board が横並びまたは縦積みで live になる
- 利用者は `changed` board 上の差分 tile を tap して round を進める
- wrong tap は `misses` に加算されるが run は継続する
- difference type は位置ずれ、向き、欠落、色差を含み、difficulty に応じて混在する
- required round をすべて終えると自動で Result へ遷移する
- Result、profile、rankings では `clear time` と `misses` を確認できる

## Acceptance Criteria

- `Spot Change` card が Home に表示され、game route を開ける
- narrow viewport でも 2 board の比較と tap 操作が同一画面で完結する
- 2 分以内で clear または timeout が確定する
- difference type が位置ずれ、向き、欠落、色差の複数種を含む
- run 完了時に `clear time` と `misses` が保存される

## Edge Cases

- run 開始前の tap は board state を変えない
- すでに見つけた差分 tile を再度 tap しても progress を重複加算しない
- touch と mouse の両方で差分 tile を選択できる

## Constraints and Dependencies

- primary metric は existing duration formatter を使う
- save failure 時も `misses` を recovery draft に保持する

## Distinction

- pure target hunt ではなく before/after comparison が core

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
