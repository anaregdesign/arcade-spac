# Mobile Game Workspace Controls Density

## Summary

全 game で共通利用している workspace controls card を、narrow mobile viewport でも play 開始前の視認性を崩さない compact layout にする。

## User Problem

- 現在の controls card は `Difficulty` selector、status chip、`How to play` action が縦に大きく積まれやすく、mobile では board より先に共通 chrome が画面を占有する
- 共通 card が大きすぎると、game を開いた直後に board の開始位置が見えにくくなり、play 前に scroll が必要になりやすい
- この card は全 game で再利用されているため、1 つの mobile density 問題が全 route に波及する

## Users and Scenarios

- プレイヤーは任意の game を mobile で開いたとき、`Difficulty` を確認してすぐ board の開始位置まで視線を移したい
- プレイヤーは `How to play` を必要なときだけ開きつつ、通常時は compact な controls で play を始めたい
- 開発者は shared controls card を 1 か所直すだけで、全 game の mobile layout に同じ改善を反映したい

## Scope

- shared game workspace controls card の narrow mobile layout を compact 化する
- `Difficulty` label / selector、status chip row、primary action の spacing と reflow を mobile 向けに調整する
- 共通 controls card の変更が全 game workspace に反映される状態にする

## Non-Goals

- game-specific board や summary panel の個別 redesign
- desktop layout の大幅な変更
- touch target を犠牲にして全 game board を機械的に viewport 内へ縮小すること

## User-Visible Behavior

- narrow mobile viewport では controls card の上下 padding、field spacing、action size が compact になり、`Difficulty` selector が過剰な縦幅を使わない
- `Difficulty` selector と `How to play` action は mobile でも touch-safe を保ちつつ、status chip と合わせて tighter に reflow する
- 共通 controls card が原因で board の開始位置が initial viewport から大きく押し下げられない
- desktop では既存の controls card pattern を維持し、readability と action affordance を損なわない

## Acceptance Criteria

- shared controls card を使う全 game workspace で、mobile 時に compact controls layout が共通で適用される
- 390px 前後の portrait mobile viewport で、controls card が現状より短くなり、board の開始位置が初期表示内に入りやすくなる
- `Difficulty` selector、status chip、`How to play` action は mobile でも tap しやすく、text が読める
- status chip 数が多い game でも overflow や unreadable な潰れが起きず、必要な status は wrap して読める
- desktop と mobile の両方で shared controls card の表示崩れがない

## Edge Cases

- status chip が 6 個以上ある game でも card が極端に縦伸びせず、chip が自然に wrap する
- `How to play` action がある game と複数 action を持つ game の両方で compact reflow が破綻しない
- play 中に `Difficulty` selector が disabled でも compact layout が崩れない

## Constraints and Dependencies

- 実装対象は `app/components/games/shared/` 配下の shared controls card とその style に限定する
- mobile density 改善は touch target と readability を維持する best practice を優先する
- Active execution tracker: `/docs/plans/plan.md`

## Links

- Related: [ui-specs.md#game-workspace-shared-components](./ui-specs.md#game-workspace-shared-components)
- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Plan: [../plans/plan.md](../plans/plan.md)
