# Game Catalog 50 Expansion Program

## Summary

`Arcade` の catalog を 50 本規模まで広げ、どのゲームも短時間で始めて終えられる browser game として遊べる状態にする。

## User Problem

- Catalog 本数が少ないと、継続利用時の回遊性が弱い
- 新しいゲームが似た遊び方に偏ると、catalog 全体の魅力が落ちる
- 追加ゲームが既存導線に乗らないと、増えるほど使いにくくなる

## Users and Scenarios

- プレイヤーは短い run で多様なゲームを切り替えて遊びたい
- プレイヤーは timing、memory、logic、visual hunt、spatial transform、audio 系など違う skill type を行き来したい
- 継続利用者は、新しいゲームでも既存の Home、Result、Rankings、Profile で同じように扱いたい

## Scope

- Catalog を 50 本規模まで拡張する
- 各ゲームを Home、Game、Result、Rankings、Profile の共通導線へ載せる
- Game ごとの差別化を保ち、catalog 全体の mechanic family を分散させる

## Non-Goals

- 既存ゲームの全面 redesign
- 長時間 run や meta progression の導入
- multiplayer や networked play の追加

## User-Visible Behavior

- Home では 50 本規模のゲームを同じ密度で探索できる
- どのゲームも短時間で clear または fail が確定する
- 新旧どのゲームも How to play、Result、Rankings、Profile の共通パターンに乗る
- Catalog 全体として、似た入力や同じ見た目の焼き直しばかりに見えない

## Acceptance Criteria

- Catalog 拡張後も、Home から新旧すべてのゲームへ同じように辿れる
- 追加ゲームでも Result、Rankings、Profile で同じ情報の取り回しができる
- Catalog を一覧したとき、mechanic family の偏りが目立たない

## Edge Cases

- 新規ゲームでも、まだ実績がないだけで Home 上から消えない
- Catalog が増えても、探索性の悪化で既存ゲームが見つけにくくならない

## Similarity Guardrails

- 同じ primary interaction を使う場合でも、board representation、decision model、failure pressure のうち複数を変える
- Timing、memory、logic、visual search、spatial transform、action precision、growth strategy、audio discrimination の偏りを避ける
- `same input with different skin` のゲームは採用しない

## Links

- Related: [product-specs.md](./product-specs.md)
- Expansion Wave: [games/two-minute-expansion-wave.md](./games/two-minute-expansion-wave.md)
