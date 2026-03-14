# Two-Minute Expansion Wave

## Summary

`Arcade` の既存 lineup を残したまま、`1 run が 2 分以内で完結する game` を 10 本 pure-add する。追加対象は `Orbit Tap`、`Target Trail`、`Path Recall`、`Pulse Count`、`Quick Sum`、`Symbol Hunt`、`Light Grid`、`Tile Shift`、`Stack Sort`、`Mirror Match` とし、home、workspace、result、rankings、profile まで既存導線で一貫して扱える状態を定義する。

## User Problem

- 既存 catalog だけでは短時間 replay に偏りや style の幅がまだ足りない
- home から選べる game 数が少ないと、短時間利用時に「今日は何を遊ぶか」の選択肢が狭い
- memory、timing、logic、perception、spatial の練習先を 1 つの app 内で横断したい

## Users and Scenarios

- ユーザは home から 2 分以内で終わる game を選び、短い集中 run を繰り返したい
- ユーザは game ごとの best metric と support metric を result、rankings、profile で比較したい
- ユーザは未プレイの新規 game も既存 game と同じ navigation、help、result pattern で迷わず始めたい

## Scope

- 10 本の新規 game spec を `/docs/spec/games/` に追加する
- 10 本の新規 game を existing shared route、result flow、ranking flow、profile flow に統合する
- すべての game を `1 run <= 2 minutes` の難易度設計にする
- home preview、help dialog、result summary、share text、game catalog metadata を追加対象まで広げる

## Non-Goals

- 既存 game の削除や置き換え
- real-time multiplayer や co-op mode
- 長時間 campaign、daily event、unlock tree
- production deploy policy 自体の変更

## User-Visible Behavior

- home では 10 本の新しい game card が既存 lineup に pure-add で表示される
- 各 game は既存の `games.$gameKey` route から開始でき、shared controls card、board overlay、finish card、help pattern を使う
- run 完了時は追加の save confirm を要求せず、existing result flow に自動遷移する
- result、rankings、profile では新しい game の best metric と support metric が既存 game と同じ密度で表示される
- 新規 10 本はすべて、`Easy` から `Expert` までを含めて `1 run <= 2 minutes` に収まる

## Acceptance Criteria

- home、result、rankings、profile で 10 本すべての game が catalog として認識される
- 10 本すべてに individual spec document がある
- 10 本すべてに preview asset、workspace registry entry、game-specific instructions がある
- 10 本すべてが local verification を通り、production release workflow へ載せられる
- repository policy に従い、production deploy は GitHub Workflow 経由で行われる

## Edge Cases

- play summary や ranking summary がまだ存在しない新規 game でも home card は `New` として表示される
- save failure 時は existing recovery draft flow で support metric を保持する
- narrow viewport でも game board と primary action が同一 screen 内で完結する

## Constraints and Dependencies

- durable spec は `/docs/spec/` に置き、active tracker は `/docs/plans/plan.md` を使う
- app code は existing `game-workspace` architecture と shared result flow を維持する
- production release は local Azure CLI deploy ではなく GitHub release workflow を使う

## Links

- Plan: [../../plans/plan.md](../../plans/plan.md)
- Related: [../product-specs.md](../product-specs.md)
- Game: [orbit-tap-game.md](./orbit-tap-game.md)
- Game: [target-trail-game.md](./target-trail-game.md)
- Game: [path-recall-game.md](./path-recall-game.md)
- Game: [pulse-count-game.md](./pulse-count-game.md)
- Game: [quick-sum-game.md](./quick-sum-game.md)
- Game: [symbol-hunt-game.md](./symbol-hunt-game.md)
- Game: [light-grid-game.md](./light-grid-game.md)
- Game: [tile-shift-game.md](./tile-shift-game.md)
- Game: [stack-sort-game.md](./stack-sort-game.md)
- Game: [mirror-match-game.md](./mirror-match-game.md)
