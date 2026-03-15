# Home Thumbnail Framing Tuning

## Summary

Home のゲーム一覧で使う 50 件すべての preview thumbnail を、ゲーム内容がひと目で伝わる simple な square artwork として再生成しつつ、framing をより密に詰め、内容を見切らせずに一覧比較しやすくする。

## User Problem

- Home の preview thumbnail は game ごとに visual complexity と framing のばらつきがあり、一覧で見たときに内容の読み取りやすさが揃っていない
- 現在の thumbnail は square contract 自体は揃ったが、scene の余白が広めで board や mechanic の主役が少し遠く見える
- 一部の Home card は preview mapping の欠落で fallback 表示になり、50 game を thumbnail で比較する体験が欠けている
- asset を再生成する手順が再利用しにくいと、今後の調整時に style や contract が崩れやすい

## Users and Scenarios

- ユーザは Home で 50 game を一覧しながら、thumbnail を主な手がかりとして遊ぶ game を選びたい
- ユーザは thumbnail を見ただけで、その game が timing, memory, grid logic, path, target など何をするものかを大まかに把握したい
- 開発者は preview asset を一括で再生成し直せる再現可能な workflow を持ち、後続の修正でも同じ square contract を維持したい

## Scope

- Home で使う 50 件すべての preview asset を square thumbnail として再生成する
- 各 thumbnail を、ゲームごとの中心 mechanic や board motif が分かる simple な artwork に揃える
- 各 thumbnail の framing を詰め、内容を見切らせずに主役モチーフを前に出す
- Home preview mapping の欠落を解消し、50 game すべてが preview asset を表示できる状態にする
- 今後 missing preview や non-square asset が混ざっても検知できる verification を追加または更新する

## Non-Goals

- Home の game card 全体レイアウト変更
- 実ゲーム画面の UI や board layout の変更
- thumbnail 用の説明 copy や card metadata の増量

## User-Visible Behavior

- Home の 50 game card は、すべて square thumbnail で表示される
- どの thumbnail も、ゲームの中心 mechanic や board motif が simple な shape, color, layout で読み取れる
- どの thumbnail も、主役となる board や icon が現在より大きく見え、余白が広すぎない
- 同じ grid に並べたとき、thumbnail の密度や framing が極端にぶれず比較しやすい
- `sum-grid`, `hidden-find`, `swap-solve`, `shape-morph` を含む全 game card が fallback ではなく preview asset を表示する
- `Minesweeper` や `Sudoku` を含む grid-heavy な preview でも主要な盤面情報を読める

## Acceptance Criteria

- Home で参照する 50 件すべての game が preview asset を持ち、fallback initials に落ちない
- 50 件すべての preview asset が square ratio になっている
- 各 thumbnail は simple な artwork でありつつ、対象 game の内容を他の game と見分けられる
- 各 thumbnail は主役モチーフが十分大きく、余白の多さで弱く見えない
- framing を詰めても、重要な内容が見切れず一覧での読みやすさが改善している
- Home の game grid で thumbnail の見え方が game ごとに不自然にばらつかない
- missing preview、参照切れ、non-square asset を regression test で検知できる

## Edge Cases

- 既存の square asset を置き換えても、主要モチーフの読みやすさを悪化させない
- もともと横長構図だった preview でも、主要情報が center から極端に外れない
- board-heavy な puzzle は、情報量を詰め込みすぎずに盤面ルールが分かる最低限の cue を残す
- framing を詰めても、重要情報が edge で切れたり欠けたりして game 内容が逆に分かりにくくならない
- asset format を SVG に揃えても、Home の見え方や loading に不自然な差が出ない

## Constraints and Dependencies

- preview asset 側で square contract と visual simplicity を担保し、Home card 側の per-game CSS 例外は増やさない
- 再生成結果は再利用可能な script で吐き出せる状態を優先する
- 実行履歴は `docs/plans/plan.20260315-082817.md` に archive される

## Links

- Latest Plan Archive: [../plans/plan.20260315-082817.md](../plans/plan.20260315-082817.md)
- Earlier Plan Archive: [../plans/plan.20260315-081056.md](../plans/plan.20260315-081056.md)
- Previous Plan Archive: [../plans/plan.20260315-073133.md](../plans/plan.20260315-073133.md)
