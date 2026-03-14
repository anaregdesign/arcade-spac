# Color Census

## Summary

`Arcade` に `Color Census` を追加する。短時間だけ表示される mosaic の色分布を見て、most frequent color や exact count relation を答える rapid estimation game とする。

## User Problem

- `Color Sweep` の局所判別とは違い、全体の色分布を短時間で集計する game がほしい
- watch-only memory と quick multiple-choice answer を組み合わせた perception sprint がほしい

## Users and Scenarios

- 利用者は Home から `Color Census` を開き、短時間だけ表示される mosaic を集中して見たい
- 利用者は answer phase で most frequent color や exact count query にすぐ答えたい
- 利用者は Result で `clear time` と `mistakes` を見て replay したい

## Scope

- `Color Census` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `mistakes` とする
- query variation には majority と exact count の両方を含める

## Non-Goals

- freeform numeric input
- long-form statistics dashboard
- accessibility palette customization beyond current contrast-safe UI

## User-Visible Behavior

- idle overlay から run を開始すると、watch phase で mosaic が短時間表示される
- watch phase が終わると query と answer choices が表示される
- 利用者は most frequent color や exact count query に答え、correct answer で次 round へ進む
- wrong answer は `mistakes` に加算されるが run は継続する
- sprint を最後まで完了すると自動で Result へ遷移する
- Result、profile、rankings では `clear time` と `mistakes` を確認できる

## Acceptance Criteria

- `Color Census` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- exact count と relative majority の両方を扱う
- touch と mouse の両方で answer selection を完了できる
- run 完了時に `clear time` と `mistakes` が保存される

## Edge Cases

- watch phase 中の answer tap は round state を進めない
- wrong answer 後も current query に再回答できる
- narrow viewport でも mosaic と query が同一画面で読める

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- primary metric は existing duration formatter を使う
- save failure 時も `mistakes` を recovery draft に保持する

## Distinction

- Color Sweep の局所判別ではなく、全体分布の短期集計が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
