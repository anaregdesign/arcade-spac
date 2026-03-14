# Hue Drift

## Summary

`Arcade` に `Hue Drift` を追加する。連続する color gradient の変化を読み、欠けた 1 step を candidate から当てていく short-session color pattern puzzle とする。

## User Problem

- `Color Sweep` の target search とは別に、色の連続変化そのものを推論する game がほしい
- 色差だけでなく hue、saturation、lightness の drift を短時間で読む sprint play がほしい

## Users and Scenarios

- 利用者は Home から `Hue Drift` を開き、gradient strip の欠けた step をすぐ読み取りたい
- 利用者は candidate から正しい tile を選び、連続 prompt をテンポ良く解きたい
- 利用者は Result で `clear time` と `mistakes` を見て replay したい

## Scope

- `Hue Drift` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `mistakes` とする
- prompt ごとに hue、saturation、lightness drift の rule を切り替える

## Non-Goals

- freeform color picker input
- accessibility palette customization beyond current contrast-safe UI
- endless mode

## User-Visible Behavior

- idle overlay から run を開始すると、欠けた 1 step を含む gradient row が live になる
- 利用者は 4 つの candidate から正しい color tile を選ぶ
- correct answer で次 prompt へ進み、wrong answer は `mistakes` に加算されるが run は継続する
- prompt variation には hue、saturation、lightness drift が混在する
- sprint をすべて解くと自動で Result へ遷移する
- Result、profile、rankings では `clear time` と `mistakes` を確認できる

## Acceptance Criteria

- `Hue Drift` card が Home に表示され、game route を開ける
- 2 分以内で clear または timeout が確定する
- 色差だけでなく明度や彩度も variation に入る
- touch と mouse の両方で answer selection を完了できる
- run 完了時に `clear time` と `mistakes` が保存される

## Edge Cases

- run 開始前の answer tap は prompt state を変えない
- wrong answer 後も current prompt の candidate が残り、即座に再回答できる
- narrow viewport でも gradient row と candidate が同一画面で読める

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- primary metric は existing duration formatter を使う
- save failure 時も `mistakes` を recovery draft に保持する

## Distinction

- Color Sweep の target 検索ではなく、連続色変化の推論が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
