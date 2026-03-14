# Component DOM Hierarchy Reorganization

## Summary

`app/components` 配下を screen ごとの DOM/feature 階層に沿って再配置し、複数画面で使う presentational component は `app/components/shared/` へ寄せる。画面の見た目や挙動は維持したまま、routes から見た import と component ownership を明確にする。

## User Problem

- 現在の `app/components` には `HomeDashboard`、`LoginScreen`、`ProfileScreen`、`RankingsScreen` など feature 固有の component が top-level に平置きされており、DOM/feature ownership が読み取りづらい
- 共通 component と feature 固有 component の境界が曖昧で、再利用判断や今後の extract が難しい
- route module から見た import path が flat すぎて、component hierarchy と screen structure が一致していない

## Users and Scenarios

- 開発者は route ごとの presentational component が feature directory にまとまった状態で読みたい
- 開発者は shared component を `app/components/shared/` から見つけられる状態で再利用を進めたい
- 開発者はこの整理後も Home、Login、Profile、Rankings、Gameplay、Result の見た目と操作を変えずに保守したい

## Scope

- `app/components` 配下の top-level screen component を canonical な feature directory へ移す
- cross-feature で使う presentational component を `app/components/shared/` へ寄せる
- 明確に重複している summary-style presentational markup を薄い shared component に抽出する
- route modules と component imports を新しい配置へ合わせて更新する

## Non-Goals

- route behavior、loader/action contract、usecase の責務変更
- screen copy や visual design の再設計
- game-specific workspace component の大規模再構成

## User-Visible Behavior

- Home、Login、Profile、Rankings、Gameplay、Result の表示内容と操作フローは変わらない
- レイアウト整理後も既存の navigation、form submit、filter/sort、result replay は同じように使える

## Acceptance Criteria

- `HomeDashboard`、`LoginScreen`、`ProfileScreen`、`RankingsScreen` は top-level ではなく、それぞれの feature directory 配下に存在する
- `AppShell` のような cross-feature component は `app/components/shared/` 配下に存在する
- shared 化した presentational component は少なくとも複数画面から利用され、単なる alias ではない
- 関連 route module の import は新配置へ更新され、build が通る
- local verification で Home、Login、Profile、Rankings、Gameplay、Result の主要 route が崩れない

## Constraints and Dependencies

- `/docs/plans/plan.md` を active execution tracker として使い、完了後は archive する
- `app/components/<feature>/` と `app/components/shared/` の canonical placement を守る
- feature-specific component を新しい generic bucket に逃がさない

## Links

- Related: [product-specs.md](./product-specs.md)
- Plan: [../plans/plan.20260314-151923.md](../plans/plan.20260314-151923.md)