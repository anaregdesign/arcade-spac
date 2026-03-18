# Two-Minute Expansion Wave

## Summary

`Arcade` の既存 lineup を残したまま、`1 run が 2 分以内で完結する game` を 10 本追加し、短時間で切り替えて遊べる幅を大きくする。

## User Problem

- 既存 lineup だけでは、短時間 replay の選択肢がまだ少ない
- Memory、timing、logic、perception、spatial の練習先を 1 つの app 内で横断したい
- 新規ゲームが既存導線に乗らないと、catalog が増えても使いやすさが上がらない

## Users and Scenarios

- プレイヤーは Home から 2 分以内で終わるゲームを選び、短い集中 run を繰り返したい
- プレイヤーは各ゲームの best metric と support metric を Result、Rankings、Profile で比較したい
- 新規ゲームでも既存ゲームと同じ navigation、help、result pattern で始めたい

## Scope

- `Orbit Tap`、`Target Trail`、`Path Recall`、`Pulse Count`、`Quick Sum`、`Symbol Hunt`、`Light Grid`、`Tile Shift`、`Stack Sort`、`Mirror Match` を追加する
- 10 本すべてを Home、Game、Result、Rankings、Profile の共通導線へ載せる
- すべてのゲームを `1 run <= 2 minutes` の体験として設計する

## Non-Goals

- 既存ゲームの削除や置き換え
- Real-time multiplayer や co-op mode
- 長時間 campaign や unlock tree

## User-Visible Behavior

- Home では 10 本の新しいゲーム card が既存 lineup に追加される
- 各ゲームは既存の game route から始められる
- Run 完了時は既存の Result 導線へ進み、新しいゲームも同じ密度で比較できる
- 新規 10 本はすべて、`Easy` から `Expert` までを含めて `1 run <= 2 minutes` に収まる

## Acceptance Criteria

- Home、Result、Rankings、Profile で 10 本すべてのゲームを認識できる
- 10 本すべてに individual spec がある
- 新規ゲームでも既存ゲームと同じ導線で開始、完了、結果確認ができる

## Edge Cases

- まだ play summary がない新規ゲームでも Home から見つけて起動できる
- Narrow viewport でも game board と主要 action が分断されない

## Links

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
