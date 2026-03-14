# Bubble Spawn

## Summary

`Arcade` に `Bubble Spawn` を追加する。field に継続 spawn する bubble が成長していく中、burst order と chain timing を管理して overcrowd を防ぐ growth-pressure survival game とする。

## User Problem

- current catalog は clear-time sprint が多く、space pressure を管理し続ける survival loop が不足している
- reflex と strategy を同時に要求する growth game を増やしたい

## Users and Scenarios

- 利用者は Home から `Bubble Spawn` を開き、field saturation を見ながら危険な bubble を先に burst したい
- 利用者は cluster を狙って chain burst を起こし、space をまとめて回収したい
- 利用者は Result、profile、rankings で `survived seconds` と `chain bonus` を確認したい

## Scope

- `Bubble Spawn` を home、workspace、result、rankings、profile に統合する
- primary metric は `survived seconds`、support metric は `chain bonus` とする
- workspace では saturation meter、bubble growth、spawn pressure、last chain result を live 表示する

## Non-Goals

- fluid simulation sandbox
- multiplayer territory control
- idle incremental progression

## User-Visible Behavior

- idle overlay から run を開始すると、small bubble が field に継続 spawn し、時間とともに成長する
- 利用者は bubble を tap して burst し、space を回収する
- 大きい bubble や近接 cluster を崩すと nearby bubble も連鎖して burst し、`chain bonus` が増える
- saturation meter が上がり続け、field coverage が上限を超えると run は fail になる
- target survival time に到達すると clear になり Result に遷移する
- Result、profile、rankings では `survived seconds` と `chain bonus` を確認できる

## Acceptance Criteria

- `Bubble Spawn` card が Home に表示され、game route を開ける
- 1 run は 2 分以内で clear または fail が必ず確定する
- bubble growth、spawn pressure、chain burst が visible に機能する
- workspace 上で saturation meter、largest threat bubble、last chain result が更新される
- Result、profile、rankings では `survived seconds` と `chain bonus` が保存される

## Edge Cases

- run 中以外の burst input は state を変えない
- simultaneous chain burst でも duplicate scoring が起きない
- spawn overlap は deterministic resolution で整理される
- narrow viewport でも field と saturation meter が見切れず touch-safe に保たれる

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を bubble state、saturation meter、chain bonus、run outcome に付ける
- spawn variation はあっても fairness を崩さない bounded pattern set にする

## Distinction

- `Tap Safe` の short hazard recognition ではなく、field pressure を継続管理する survival loop が主題
- `Cascade Clear` の discrete combo puzzle ではなく、real-time growth と chain burst の management が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
