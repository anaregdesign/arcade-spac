# Home Thumbnail Framing Tuning

## Summary

Home の preview thumbnail は、ゲーム内容をひと目で伝えつつ、一覧比較しやすい framing と密度に揃える。

## User Problem

- Thumbnail ごとに余白や framing の差が大きいと、一覧比較がしづらい
- 主役の board や icon が遠く見えると、ゲーム内容を瞬時に読み取りにくい
- 一部 thumbnail が fallback 的に見えると、catalog 全体の質感が揃わない

## Users and Scenarios

- プレイヤーは Home の一覧を見ながら、thumbnail を主な手掛かりに次のゲームを選びたい
- プレイヤーは thumbnail を見ただけで、そのゲームの主題を大まかに理解したい

## Scope

- Thumbnail の framing と余白を揃える
- 主役要素を見切らせず、比較しやすい密度へ整える
- Fallback 的な見え方をなくし、catalog 全体の見え方を揃える

## Non-Goals

- Home card 全体の redesign
- 実ゲーム画面の UI 変更
- Card 本文の情報量増加

## User-Visible Behavior

- どの thumbnail も主役の board や icon が十分大きく見える
- 一覧で並べたとき、framing と密度のばらつきが減る
- 主要ゲームの thumbnail が fallback ではなく内容を伝える preview として機能する

## Acceptance Criteria

- Thumbnail の主役要素が不自然に小さく見えない
- 重要な内容が edge で切れず、余白が広すぎない
- 一覧比較時の違和感が目立たなくなる

## Edge Cases

- Grid-heavy な thumbnail でも必要な情報が潰れない
- Framing を詰めても窮屈に見えない
