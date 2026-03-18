# Box Fill

## Summary

`Arcade` に `Box Fill` を追加する。piece tray から shape を選び、rotate と tap-first placement で irregular box を無駄なく埋め切る static packing puzzle とする。

## User Problem

- catalog には transform puzzle はあるが、packing と area efficiency を主題にした placement game が不足している
- drag or place 系の board editing interaction を増やし、多様な touch path を持たせたい

## Users and Scenarios

- 利用者は Home から `Box Fill` を開き、piece set を見て box を無駄なく埋めたい
- 利用者は workspace で remaining pieces、filled area、placement errors を見ながら puzzle を進めたい
- 利用者は Result、profile、rankings で `clear time` と `placement errors` を確認したい

## Scope

- `Box Fill` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `placement errors` とする
- workspace では box board、piece tray、selected piece、preview anchor、snap preview、remaining coverage を visible にする

## Non-Goals

- physics-based falling pieces
- freeform drawing editor
- endless sandbox packing

## User-Visible Behavior

- idle overlay から run を開始すると、irregular box と piece tray が表示される
- 利用者は piece を選んで rotate し、board 上の one-cell anchor を選んで preview を確認してから `Place piece` で snap placement する
- valid placement は board に固定され、box coverage が更新される
- overlap、out-of-bounds、無効 cell への配置は block され、`placement errors` が増える
- box を完全に埋めると次の puzzle に進み、規定 puzzle 数を完了すると Result に遷移する
- timer が切れた場合は fail として Result に遷移し、workspace では埋まった area と remaining pieces を確認できる

## Acceptance Criteria

- `Box Fill` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- piece selection、rotation、placement preview、snap placement が visible に機能する
- box shape と piece composition に variation があり、単純な繰り返しにならない
- Result、profile、rankings では `clear time` と `placement errors` が保存される

## Edge Cases

- run 中以外の selection と placement input は state を変えない
- already placed piece を再配置する場合は explicit undo or pick-up path が必要である
- touch device では drag を前提にせず、tap-to-select / rotate / anchor tap / place の flow だけで完結できる
- narrow viewport でも tray と board のどちらも操作可能で horizontal overflow を起こさない

## Constraints and Dependencies

- placement preview は pointer と touch の両方で読み取れるようにする

## Distinction

- `Block Tessellate` の gravity placement ではなく、static packing planning と retry efficiency が主題
- `Tile Shift` の board transform ではなく、piece inventory を管理する area fill puzzle

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
