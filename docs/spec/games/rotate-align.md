# Rotate Align

## Summary

`Arcade` に `Rotate Align` を追加する。single-board 上の path tile を rotate し、start から end までの pathway を一筆接続する multi-round rotation puzzle とする。

## User Problem

- `Tile Shift` や `Flip Match` とは違い、rotation-specific interaction を主役にした logic sprint がほしい
- target board を見比べ続けるのではなく、その場の board を読みながら path を復元する puzzle がほしい

## Users and Scenarios

- 利用者は Home から `Rotate Align` を開き、start から end まで line をつなぐ board を始めたい
- 利用者は tile ごとの connector 向きを見ながら、少ない rotations で path を復元したい
- 利用者は Result で `clear time` と `rotations` を見て replay したい

## Scope

- `Rotate Align` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `rotations` とする
- run は single puzzle ではなく short multi-round sprint とする

## Non-Goals

- free-rotate sandbox board
- drag interaction
- branch-heavy network editor

## User-Visible Behavior

- idle overlay から run を開始すると、start と end を含む path board が表示される
- 利用者は tile を tap / click して 90-degree rotation を進める
- board 上の path が start から end までつながると current round が clear し、次 round が自動で始まる
- full sprint を完了すると自動で Result へ遷移する
- timeout 時は未 clear のまま Result へ遷移する
- Result、profile、rankings では `clear time` と `rotations` を確認できる

## Acceptance Criteria

- `Rotate Align` card が Home に表示され、game route を開ける
- run 全体は 2 分以内に clear または timeout が確定する
- rotation interaction が board 上で明確に読める
- start と end の位置が narrow viewport でも判別できる
- run 完了時に `clear time` と `rotations` が保存される

## Edge Cases

- run 中以外の rotate input は board state を変えない
- empty tile は route の判定対象にしない
- idle preview は SSR/client で同じ board を出し hydration drift を起こさない

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- primary metric は existing duration formatter を使う
- `rotations` は existing count support metric contract に載せる

## Distinction

- `Tile Shift` の row/column shift ではなく、individual tile rotation が主題
- `Path Recall` の記憶再現ではなく、live board の connection logic に集中する

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
