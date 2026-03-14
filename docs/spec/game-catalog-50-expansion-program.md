# Game Catalog 50 Expansion Program

## Summary

Arcade の catalog を現行 17 本から 50 本へ拡張し、各ゲームが 2 分以内の 1 run で完結する短時間 browser game として遊べる状態にする。追加する 33 本は既存ゲーム群とも相互にも似すぎないよう mechanic family を分散させ、各ゲームごとに user-visible な individual spec、実装、UI verification、段階的 commit を残す。

## User Problem

- 現在の catalog は短時間 arcade として十分遊べるが、継続的に回遊できる本数にはまだ達していない
- 追加ゲームを場当たりで増やすと、既存ゲームの焼き直しや似た入力体験が増えて catalog の価値が落ちる
- 仕様書、実装、verification、commit log の粒度が揃っていないと、50 本規模の expansion を安全に進めにくい

## Users and Scenarios

- 利用者は 2 分以内で完結する多様なゲームを次々に遊びたい
- 利用者は同じ catalog 内で、timing、memory、logic、visual hunt、transformation など違う skill type を切り替えて遊びたい
- 開発者は各ゲームの spec を先にレビューし、1 本ずつ UI verification 付きで導入したい

## Scope

- 33 本の新規ゲーム concept を定義し、現行 17 本と合わせて 50 本 catalog にする
- 各ゲームごとに 1 本の individual spec document を用意する
- 各ゲームを route、workspace component、preview、result integration を含めて実装する
- 各ゲームごと、または小さな reviewed slice ごとに UI verification と commit を残す

## Non-Goals

- 既存 17 本の根本 redesign
- 2 分を超える長時間 run を前提にしたゲーム設計
- multiplayer、networked play、meta progression の導入

## User-Visible Behavior

- Home から 50 本の distinct game catalog を閲覧できる
- 各ゲームは 2 分以内で clear または fail が確定する
- 各ゲームには help/instructions、result summary、preview thumbnail がある
- 似た入力や盤面が続きすぎず、catalog 内で skill family が分散している

## Acceptance Criteria

- `supportedGames` に 50 本の game definition が存在する
- 追加 33 本それぞれに対応する individual spec が `docs/spec/games/` に存在する
- 各ゲームは Home から開けて playable であり、Result まで到達できる
- 各ゲームに対して UI verification が行われ、問題があればその場で修正される
- commit history に reviewed slice 単位の記録が残る

## Edge Cases

- 新規ゲーム同士で core loop が近すぎる場合は implementation 前に spec で差別化する
- 入力 device が pointer でも touch でも主要操作を完結できるようにする
- difficulty variation があっても 1 run は 2 分以内に収まる

## Constraints and Dependencies

- spec-driven workflow に従い、program spec と individual specs を先に揃える
- 各ゲームは React Router + current gameplay architecture に沿って実装する
- progress は `docs/plans/plan.md` で追跡し、完了後 archive する
- commit は coherent な reviewed slice 単位で切る

## Similarity Guardrails

- 同じ primary interaction を使う場合でも board representation、decision model、failure pressure のうち少なくとも 2 つを変える
- 既存 family と追加 family の偏りを避け、timing、memory、logic、visual search、spatial transform、action precision、growth strategy を分散させる
- `same input with different skin` のゲームは採用しない

## Links

- Plan: [../plans/plan.md](../plans/plan.md)
- Related: [product-specs.md](./product-specs.md)
- Related: [ui-specs.md](./ui-specs.md)
