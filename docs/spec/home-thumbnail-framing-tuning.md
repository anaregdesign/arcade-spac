# Home Thumbnail Framing Tuning

## Summary

Home のゲーム一覧で使う 50 件すべての preview thumbnail を square に揃え、どの game card でも同じ縦横比と安定した framing で比較できるようにする。

## User Problem

- Home の preview asset は square と landscape が混在していて、game ごとに framing の取り方が揃わない
- 同じ grid に並んでいても、thumbnail の情報密度や見え方が game ごとにぶれやすい
- source asset が non-square のままだと、別画面や今後の再利用でも thumbnail の見え方が不安定になりやすい

## Users and Scenarios

- ユーザは Home で 50 game を一覧しながら、thumbnail を主な手がかりとして遊ぶ game を選びたい
- 開発者は新しい grid や preview 再利用先でも、thumbnail の ratio 差分を個別 CSS で吸収したくない

## Scope

- Home で使う 50 件すべての preview asset を square thumbnail として扱える状態に揃える
- 既存の game card layout は維持したまま、thumbnail の framing だけを安定化する
- 今後 non-square thumbnail が混ざっても検知できる verification を追加する

## Non-Goals

- Home の game card 全体レイアウト変更
- 各 preview artwork の全面 redesign
- 実ゲーム画面の UI や board layout の変更

## User-Visible Behavior

- Home の 50 game card は、すべて square thumbnail で表示される
- どの thumbnail も周囲の framing が極端に異ならず、一覧で並べたときに比較しやすい
- `Minesweeper` や `Sudoku` を含む既存 preview は、square 化しても主要な盤面情報を読める

## Acceptance Criteria

- Home で参照する 50 件すべての preview asset が square ratio になっている
- Home の game grid で thumbnail の見え方が game ごとに不自然にばらつかない
- square 化によって主要モチーフや盤面情報が過剰に欠けない
- square thumbnail requirement を regression test で検知できる

## Edge Cases

- 既存の square asset は見え方を悪化させない
- もともと横長だった preview でも、主要情報が center から極端に外れない
- PNG asset も SVG asset と同じ square contract に揃う

## Constraints and Dependencies

- preview asset の source ratio を揃える方針を優先し、Home card 側の per-game CSS 例外は増やさない
- 実行中の作業は `docs/plans/plan.md` で追跡する

## Links

- Plan Archive: [../plans/plan.20260315-073133.md](../plans/plan.20260315-073133.md)
