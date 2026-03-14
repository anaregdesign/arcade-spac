# Position Lock

## Summary

`Arcade` に `Position Lock` を追加する。moving token 群の最終停止位置を記憶し、empty board 上へ同じ token を再配置する multi-round spatial memory sprint とする。

## User Problem

- `Path Recall` は order memory が中心で、final arrangement を覚える spatial memory game が不足している
- motion を見たあとに board occupancy を再構成する play pattern が catalog にない

## Users and Scenarios

- 利用者は Home から `Position Lock` を開き、moving token が止まった配置を短時間で覚えたい
- 利用者は watch phase のあとに token tray から token を選び、同じ cell に戻したい
- 利用者は round ごとの exact placements と near placements を見ながら replay したい

## Scope

- `Position Lock` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `placement errors` とする
- workspace では round accuracy と token occupancy を可視化し、saved result は shared contract に合わせて primary/support metric に載せる

## Non-Goals

- freeform drag-and-drop physics
- long-form sandbox editing
- per-token custom abilities

## User-Visible Behavior

- idle overlay から run を開始すると、token 群が board 上を短時間 move して final position で停止する
- watch phase が終わると live token は消え、利用者は token tray から token を選んで ghost board に配置する
- token をすべて置くと round accuracy が exact / near / miss で短時間表示され、次 round へ進む
- round が進むほど token count や path complexity が増える
- full sprint を終えると Result へ遷移し、`clear time` と `placement errors` を確認できる

## Acceptance Criteria

- `Position Lock` card が Home に表示され、game route を開ける
- run 全体は 2 分以内に clear または timeout が確定する
- board occupancy と round accuracy が narrow viewport でも読める
- workspace 上で `exact`, `near`, `placement errors` が visible に更新される
- Result、profile、rankings では `clear time` と `placement errors` が保存される

## Edge Cases

- watch phase 中の placement input は無効にする
- occupied cell への上書きで token duplication が起きない
- idle preview は hydration drift を起こさない

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- token differentiation は color だけに依存せず label でも区別できるようにする
- Playwright UI verification のため、board cell と token tray は stable selector を持つ

## Distinction

- `Path Recall` の route/order memory ではなく、moving endpoint arrangement の記憶に集中する
- `Swap Solve` の target board 再現ではなく、watch phase を挟んだ spatial recall が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
