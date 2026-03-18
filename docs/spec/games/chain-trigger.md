# Chain Trigger

## Summary

`Arcade` に `Chain Trigger` を追加する。固定 graph 上の source node と limited extra triggers を使って propagation chain を設計し、最少 input で全 node を点灯させる chain planning puzzle とする。

## User Problem

- `Light Grid` や `Zone Lock` は local board mutation が中心で、network propagation を読む planning puzzle が不足している
- 多様性を増やしたいが、physics や drag-heavy UI に寄せず deterministic な logic game も増やしたい

## Users and Scenarios

- 利用者は Home から `Chain Trigger` を開き、graph 上の node threshold と outgoing links を読んで propagation plan を立てたい
- 利用者は current round の source node に加え、少数の extra trigger slots をどこに使うか判断したい
- 利用者は workspace で chain result、wave order、extra triggers used を見ながら次の round に進みたい

## Scope

- `Chain Trigger` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `extra triggers used` とする
- workspace では graph board、source node、armed extra triggers、last propagation result、round progress を visible にする

## Non-Goals

- freeform graph editor
- physics-based particle simulation
- hidden randomness が chain outcome を変える resolution

## User-Visible Behavior

- idle overlay から run を開始すると、各 round に固定 graph puzzle が表示される
- graph には 1 つの source node があり、利用者は limited extra trigger slots の範囲で追加 node を arm できる
- `Fire chain` を押すと source node と armed node が wave 1 で発火し、各 node は incoming signal が threshold に達した瞬間に 1 度だけ発火して次の wave に signal を送る
- chain resolution は deterministic で、各 node に final state と activation wave が visible に残る
- 全 node が点灯すると current round が clear され、次の puzzle に進む
- chain が stalled して dark node が残った場合は round は継続し、利用者は armed nodes を組み直して再度 `Fire chain` できる
- 規定 round 数を完了すると Result に遷移し、Result、profile、rankings では `clear time` と `extra triggers used` を確認できる
- timer が切れた場合は fail として Result に遷移し、workspace では solved round 数と current stalled state を確認できる

## Acceptance Criteria

- `Chain Trigger` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- 各 round は deterministic graph puzzle で、source node、threshold、outgoing link、activation result が visible である
- workspace 上で current round、armed extra triggers、last chain wave count、solved nodes、extra triggers used、time left が更新される
- Result、profile、rankings では `clear time` と `extra triggers used` が保存される

## Edge Cases

- run 中以外の node tap と fire input は state を変えない
- armed trigger slot 上限を超える tap は無視される
- 同一 node は 1 回の chain で重複発火しない
- narrow viewport でも node button、threshold、source marker、chain result が判別できる

## Constraints and Dependencies

- pointer と touch の両方で主要操作を完結できるようにする

## Distinction

- `Light Grid` の local toggle ではなく、network propagation を読む chain planning puzzle
- `Zone Lock` の overlapping counts ではなく、threshold と outgoing links を読む deterministic trigger graph が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
