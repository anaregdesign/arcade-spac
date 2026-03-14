# Gap Rush

## Summary

`Arcade` に `Gap Rush` を追加する。moving wall が連続接近する corridor を avatar が横移動で抜け続ける continuous-feel reaction game とする。

## User Problem

- current catalog は tap timing や discrete puzzle が強い一方、continuous movement pressure を持つ game が不足している
- survival と positioning を主題にした short-form reflex game を増やしたい

## Users and Scenarios

- 利用者は Home から `Gap Rush` を開き、接近する wall gap に合わせて avatar を横移動させたい
- 利用者は workspace で current speed、perfect passes、wall streak を見ながら corridor を抜けたい
- 利用者は Result、profile、rankings で `walls cleared` と `perfect passes` を確認したい

## Scope

- `Gap Rush` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `perfect passes` とする
- workspace では corridor、continuous-feel lane drift、incoming wall preview、speed ramp を live 表示する

## Non-Goals

- endless runner with long meta progression
- combat or projectile systems
- hidden randomness that makes corridors unreadable

## User-Visible Behavior

- idle overlay から run を開始すると、wall pattern が連続で接近する corridor が始まる
- 利用者は touch-safe lane pads で target lane を選び、avatar が continuous-feel に glide しながら gap を通す
- gap を clean に center pass すると `perfect passes` が増え、run quality が上がる
- wall に触れると run は即 fail になる
- wall streak が伸びるほど speed と pattern variation が上がる
- target wall count を突破すると clear となり Result に遷移する
- Result、profile、rankings では `clear time` と `perfect passes` を確認できる

## Acceptance Criteria

- `Gap Rush` card が Home に表示され、game route を開ける
- 1 run は 2 分以内で clear または fail が必ず確定する
- target lane を変えると avatar が即 teleport せず glide し、approaching wall pressure と speed ramp が visible に機能する
- workspace 上で current speed、upcoming wall gap、perfect pass count が更新される
- Result、profile、rankings では `clear time` と `perfect passes` が保存される

## Edge Cases

- run 中以外の movement input は state を変えない
- rapid target changes を続けても avatar が corridor 外へ出ない
- same wall pattern seed なら gap timing は deterministic に再現できる
- narrow viewport でも corridor と movement controls が touch-safe に保たれる

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を avatar position、incoming wall gap、perfect pass state、run outcome に付ける
- current app result architecture に合わせ、saved ranking metric は `clear time` のまま拡張しない
- motion blur なしでも gap readability を保つ

## Distinction

- `Obstacle Stream` の lane switch survival よりも、continuous-feel horizontal positioning が主題
- `Tap Safe` の object filtering ではなく、corridor movement と spacing judgment が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
