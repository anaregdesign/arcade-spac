# Line Connect

## Summary

`Arcade` に `Line Connect` を追加する。paired node 同士を segment-by-segment path でつなぎ、交差を避けながら複数 board を連続で完成させる connection-construction puzzle とする。

## User Problem

- path construction を主題にした drag/edit interaction が catalog に不足している
- spatial puzzle の中でも「自分で線を作る」logic game を増やしたい

## Users and Scenarios

- 利用者は Home から `Line Connect` を開き、paired node を交差なく結びたい
- 利用者は workspace で completed pairs、crossing errors、current path state を見ながら puzzle を解きたい
- 利用者は Result、profile、rankings で `clear time` と `path corrections` を確認したい

## Scope

- `Line Connect` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `path corrections` とする
- workspace では board node、drawn path、active pair、remaining pair count を visible にする

## Non-Goals

- freehand sketch app
- diagonal-anywhere drawing without rules
- competitive race mode

## User-Visible Behavior

- idle overlay から run を開始すると、pair markers が置かれた compact board が表示される
- 利用者は touch-friendly segment drawing で path を描き、same-mark pair を接続する
- path が交差したり invalid cell を通ると correction が必要になり、`path corrections` が増える
- all pairs connected かつ no-cross state になると current puzzle が clear され、次の board に進む
- undo、pair reset、puzzle reset が軽快に機能する
- 規定 board 数を完了すると Result に遷移し、Result、profile、rankings では `clear time` と `path corrections` を確認できる

## Acceptance Criteria

- `Line Connect` card が Home に表示され、game route を開ける
- 1 run は 2 分以内で clear または timeout が確定する
- path drawing、crossing validation、undo or reset が visible に機能する
- workspace 上で remaining pair count、active pair、path correction count が更新される
- Result、profile、rankings では `clear time` と `path corrections` が保存される

## Edge Cases

- run 中以外の drawing input は state を変えない
- touch device では drag を前提にせず、segment-by-segment path input だけで完結できる
- same path state に対して validation outcome は deterministic である
- narrow viewport でも board が horizontal overflow を起こさず、node touch target が十分大きい

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を node pair、drawn segment、crossing state、undo action に付ける
- path readability を優先し、color だけに依存せず pair marker を区別する

## Distinction

- `Path Recall` の path replay ではなく、即興 path construction と crossing avoidance が主題
- `Rotate Align` の tile orientation ではなく、line editing そのものが主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
