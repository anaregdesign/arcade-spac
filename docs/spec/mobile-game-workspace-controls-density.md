# Mobile Game Workspace Controls Density

## Summary

共通の game workspace controls は、narrow mobile viewport でも board より先に画面を占有しすぎない compact な密度にする。

## User Problem

- Controls card が大きすぎると、ゲームを開いた直後に board の開始位置が見えにくい
- Mobile で play 前に縦スクロールが必要になると、短時間ゲームの入りが悪くなる
- 共通 controls の密度問題が全ゲームへ波及すると、catalog 全体の第一印象が揃わない

## Users and Scenarios

- プレイヤーは mobile で任意のゲームを開いたとき、controls を確認してすぐ board に視線を移したい
- プレイヤーは `How to play` を必要時だけ開き、通常時は compact な controls で始めたい
- 共通 controls を使うゲーム間で、同じような見え方と入りやすさを期待する

## Scope

- Narrow mobile viewport 向けに controls card の上下余白と要素密度を整える
- `Difficulty`、status、主要 action の reflow を compact にする
- Touch-safe を保ったまま、board の開始位置を初期表示へ寄せる

## Non-Goals

- Desktop layout の大幅な変更
- 各ゲーム board の個別 redesign
- Touch target を犠牲にした一律縮小

## User-Visible Behavior

- Narrow mobile viewport では controls card が compact に見え、board の開始位置が初期表示へ入りやすい
- `Difficulty`、status、`How to play` は touch-safe を保ちつつ縦幅を使いすぎない
- Desktop では既存の readability と操作感を保つ

## Acceptance Criteria

- 390px 前後の mobile viewport で controls が board を押し下げすぎない
- `Difficulty`、status、主要 action が mobile でも読みやすく押しやすい
- Status が多いゲームでも overflow や unreadable な潰れが目立たない

## Edge Cases

- Status が多いゲームでも自然に wrap して読める
- Primary action が複数あるゲームでも compact layout が崩れない
- Disabled 状態でも spacing が不自然に崩れない
