# Cascade Clear

## Summary

`Arcade` に `Cascade Clear` を追加する。small board 上で row または column trigger を選び、chain reaction を最大化して target score を超える combo planning puzzle とする。

## User Problem

- current catalog には deterministic logic puzzle は多いが、cascade resolver と score chase を主題にした game が不足している
- 一手の選択が派手な chain outcome に変わる spectacle-heavy puzzle を加えたい

## Users and Scenarios

- 利用者は Home から `Cascade Clear` を開き、small board を読んで最も伸びる trigger を選びたい
- 利用者は chain resolution を見ながら best cascade と remaining moves を管理したい
- 利用者は Result、profile、rankings で `clear time` と `best cascade` を確認したい

## Scope

- `Cascade Clear` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `best cascade` とする
- workspace では board、remaining moves、target score、last cascade summary を visible にする

## Non-Goals

- endless match-3 loop
- randomized loot progression
- full real-time arcade action

## User-Visible Behavior

- idle overlay から run を開始すると、small board と target score、remaining moves が表示される
- 利用者は row または column trigger を選んで cascade を開始する
- trigger 後は block clear、fall、secondary clear が deterministic に連続解決される
- longer chain ほど score が大きく伸び、`best cascade` が更新される
- move を使い切るまでに target score を超えると clear となり Result に遷移する
- score が届かないまま moves を使い切ると fail になり Result に遷移する
- Result、profile、rankings では `clear time` と `best cascade` を確認できる

## Acceptance Criteria

- `Cascade Clear` card が Home に表示され、game route を開ける
- 1 run は 2 分以内で clear または fail が確定する
- chain resolution の summary が visible であり、best cascade が読める
- workspace 上で target score、current score、remaining moves、best cascade が更新される
- Result、profile、rankings では `clear time` と `best cascade` が保存される

## Edge Cases

- run 中以外の trigger input は state を変えない
- resolution 中に duplicate trigger が受け付けられない
- same board state なら同じ trigger は同じ cascade outcome を返す
- narrow viewport でも board と score panel が見切れず readable である

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を board state、trigger controls、cascade count、score summary に付ける
- chain resolution は user が追える速度と visual summary を持つ

## Distinction

- `Zone Lock` の static count reconciliation ではなく、one-trigger cascade resolver が主題
- `Bubble Spawn` の live management ではなく、discrete combo planning と score chase が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
