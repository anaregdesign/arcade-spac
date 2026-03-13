# Arcade Game Catalog Expansion

## Summary

`Arcade` の game catalog を短時間で遊べる title 群へ段階的に拡張する。1 run が `10 秒` から `3 分` 程度で完結し、home からすぐ選べて replay しやすい game を backlog 化し、reuse しやすい batch 単位で順番に実装する。

## User Problem

- 現状の game lineup は少数で、短時間に気分で選べる幅がまだ狭い
- puzzle、timing、memory、perception などの play style が揃っていないため、継続利用時に偏りが出る
- game を一気に増やす前に catalog rule を固定しないと、metric、home tag、result copy、workspace pattern が game ごとにばらつく

## Users and Scenarios

- ユーザは home で複数カテゴリの game から、その日の気分に合う 1 本をすぐ選びたい
- ユーザは 10 秒から 3 分程度で 1 run を終え、result を見てすぐ replay または別 game へ移りたい
- 開発者は catalog が増えても、共通 workspace、result、rankings、profile に同じ pattern で game を追加したい

## Scope

- `10 秒` から `3 分` 程度で終わる short-session game の durable backlog を定義する
- game 選定基準、rollout 順序、phase ごとの implementation 方針を定義する
- phase 1 として、共通 catalog metadata を整えた上で first batch の新規 game を追加する

## Non-Goals

- 一度に backlog 全件を実装し切ること
- real-time multiplayer や live battle の導入
- audio-first game や device vibration 依存の game を phase 1 に入れること
- 専用 tutorial route や onboarding flow を game ごとに作ること

## User-Visible Behavior

- home は少数の固定 title 前提ではなく、増え続ける game catalog を search、filter、sort で横断できる hub として扱う
- 追加 game は既存 title と同じ card pattern、workspace pattern、result pattern に載る
- 各 game は touch と desktop の両方で完結でき、1 run の長さは `10 秒` から `3 分` に収まる
- phase 1 では `Color Sweep`、`Number Chain`、`Pair Flip` を追加し、既存の `Minesweeper`、`Sudoku`、`Drop Line` と同列に遊べる

## Acceptance Criteria

- durable spec に短時間 game backlog、selection rule、rollout order が記録されている
- phase 1 で追加する game は個別 spec を持ち、home、workspace、result、rankings、profile に統合される
- catalog metadata は home tag、metric label、result label を game ごとに定義できる
- phase 1 完了後、少なくとも `6` 本の game が同じ app shell と result flow で遊べる

## Edge Cases

- game 数が増えても home 上で filter option が game key の hard-code に依存しない
- metric unit が `time` 以外の game が増えても、result label と best metric 表示が破綻しない
- failed run や pending save は game ごとの support metric を保持したまま recovery できる
- future batch で high-score 型 game を入れても、phase 1 の time-based game 実装が前提を壊さない

## Constraints and Dependencies

- current app の `games.$gameKey` route、shared workspace Component、result 保存 flow を再利用する
- phase 1 は touch parity と Playwright verification を維持する
- first batch は review と verification を回しやすいよう、time-based metric を主軸にする
- backlog 全件を先に実装対象にせず、phase ごとの commit unit を保つ

## Backlog Selection Rule

- `Single-screen`: 1 画面で完結し、board と最小限の controls だけで遊べること
- `Short-session`: 1 run が `10 秒` から `3 分` 程度で収まること
- `Low-instruction`: 長文 rule を読まなくても 1 回触れば理解できること
- `Shared-result`: primary metric と support metric を共通 result pattern に載せられること
- `Touch-safe`: hover や keyboard 専用 input に依存しないこと
- `Replayable`: miss や failure 後にすぐ retry できること

## Rollout Strategy

### Phase 1 - Time-based grid and memory games

- `Color Sweep`
- `Number Chain`
- `Pair Flip`

### Phase 2 - Timing and recall games

- `Orbit Tap`
- `Pattern Echo`
- `Target Trail`
- `Path Recall`

### Phase 3 - Accuracy, arithmetic, and move-optimization games

- `Pulse Count`
- `Quick Sum`
- `Symbol Hunt`
- `Light Grid`
- `Tile Shift`
- `Stack Sort`

## Backlog

| Game | Core Loop | Typical Run | Primary Metric | Support Metric | Tags | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| `Color Sweep` | target color の tile だけを全部 tap する | `10-45s` | clear time | wrong taps | `perception`, `fast-start` | 1 |
| `Number Chain` | shuffled number を昇順で tap する | `10-60s` | clear time | wrong taps | `logic`, `fast-start` | 1 |
| `Pair Flip` | card を 2 枚ずつ開いて pair を揃える | `20-120s` | clear time | mismatch count | `memory` | 1 |
| `Orbit Tap` | orbit 中の marker が gate に重なる瞬間を tap する | `10-40s` | hit offset | misses | `timing` | 2 |
| `Pattern Echo` | flash された pad sequence を再現する | `20-90s` | clear time | wrong inputs | `memory`, `rhythm` | 2 |
| `Target Trail` | 順番に現れる target を追って tap する | `15-60s` | clear time | misses | `reflex`, `timing` | 2 |
| `Path Recall` | 一瞬見えた path を記憶して再入力する | `20-90s` | clear time | wrong cells | `memory`, `logic` | 2 |
| `Pulse Count` | flash 回数を覚えて正しい count を選ぶ | `10-30s` | answer time | wrong answers | `memory`, `perception` | 3 |
| `Quick Sum` | 連続する簡単な計算を素早く解く | `20-90s` | clear time | wrong answers | `logic` | 3 |
| `Symbol Hunt` | 指定 symbol を noisy grid から見つけて tap する | `10-45s` | clear time | wrong taps | `perception` | 3 |
| `Light Grid` | toggle で board を target state に揃える | `30-180s` | clear time | move count | `logic` | 3 |
| `Tile Shift` | row / column を動かして pattern を一致させる | `30-180s` | clear time | move count | `logic`, `spatial` | 3 |
| `Stack Sort` | colored stack を整理して同色で揃える | `40-180s` | clear time | move count | `logic` | 3 |

## Links

- Related: [product-requirements.md](./product-requirements.md)
- Related: [screen-flow.md](./screen-flow.md)
