# Game Spec Document Organization

## Summary

`docs/spec/games/` 配下に個別ゲーム仕様を、ゲームごとに独立したファイルとして整理する。cross-game の要求は共通仕様に残し、各ゲームのルール、結果指標、ランキング対象条件はそのゲーム専用の spec から辿れる状態にする。

## User Problem

- `product-requirements.md` に個別ゲームの結果指標や代表記録が混在しており、ある 1 本のゲーム仕様だけを追いたいときに参照先が分散している
- `Minesweeper` と `Sudoku` の専用 spec がなく、phase 1 lineup の全ゲームで documentation の粒度が揃っていない
- 新しいゲームを追加するときに、shared spec と game-specific spec の責務境界が曖昧になりやすい

## Users and Scenarios

- 企画者は、ある 1 本のゲームの user-visible rule、結果表示、ランキング対象条件だけを素早く確認したい
- 実装者は、shared requirement を壊さずに 1 本のゲーム仕様だけを更新したい
- レビュアーは、phase 1 lineup の全ゲームが同じ粒度で整理されていることを確認したい

## Scope

- phase 1 lineup の 6 ゲームすべてについて、`docs/spec/games/` に専用の game spec を揃える
- shared spec から個別ゲーム固有の結果指標一覧や representative metric 例を引き上げ、個別 game spec への参照へ置き換える
- `product-requirements.md` を cross-game requirement の source of truth として残し、game-specific behavior は各 game spec へ委譲する

## Non-Goals

- 実際の gameplay rule、score formula、ranking logic を変更すること
- phase 1 lineup の構成を変えること
- `screen-flow.md` や catalog backlog を個別ゲーム専用資料に分解すること

## User-Visible Behavior

- `docs/spec/games/` を開くと、phase 1 lineup の各ゲームについて 1 ファイルずつ専用 spec を辿れる
- shared spec は cross-game rule と導線定義に集中し、個別ゲームの代表記録や support metric 一覧を長く内包しない
- 個別ゲームの primary metric、support metric、失敗時の扱い、ランキング対象条件は、そのゲーム専用 spec にまとまっている

## Acceptance Criteria

- `Minesweeper`、`Sudoku`、`Drop Line`、`Color Sweep`、`Number Chain`、`Pair Flip` の 6 ゲームそれぞれに専用 spec file が存在する
- `product-requirements.md` は個別ゲームの記録一覧や representative metric 例を直書きせず、各 game spec を参照する
- phase 1 lineup の個別ゲーム仕様を辿るのに、shared spec と game spec の責務が混線しない

## Edge Cases

- 将来 7 本目以降のゲームを追加するときも、同じ単位で 1 game 1 file を追加すればよい構成になっている
- shared result layout や ranking rule が変わっても、game-specific delta だけ各 game spec に追記できる

## Constraints and Dependencies

- phase 1 lineup と既存の file naming pattern を維持する
- shared doc の cross-links は切らさない

## Links

- Requirements: [product-requirements.md](./product-requirements.md)
- Flow: [screen-flow.md](./screen-flow.md)
