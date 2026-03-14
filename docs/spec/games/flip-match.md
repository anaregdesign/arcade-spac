# Flip Match

## Summary

`Arcade` に `Flip Match` を追加する。front/back を持つ tile board を flip し、goal silhouette に一致させる multi-round binary state puzzle とする。

## User Problem

- `Light Grid` よりも rule が読みやすく、card flip の見た目で学べる board transformation game がほしい
- touch と mouse のどちらでも短い puzzle を連続 clear できる logic sprint がほしい

## Users and Scenarios

- 利用者は Home から `Flip Match` を開き、goal silhouette と live board を見比べながら run を開始したい
- 利用者は 1 tile の flip がどこまで伝播するかを学びつつ、少ない flips で board を揃えたい
- 利用者は Result で `clear time` と `flips` を見て replay したい

## Scope

- `Flip Match` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `flips` とする
- single board ではなく short multi-round sprint とする

## Non-Goals

- random unsolved board を延々触る sandbox mode
- hidden rule puzzle
- freeform board editor

## User-Visible Behavior

- idle overlay から run を開始すると、target silhouette と live board が表示される
- live board の tile を tap / click すると、自身と horizontal neighbor が flip する
- live board が target silhouette と一致すると current round が clear し、次 round が自動で始まる
- full sprint を完了すると自動で Result へ遷移する
- timeout 時は未 clear のまま Result へ遷移する
- Result、profile、rankings では `clear time` と `flips` を確認できる

## Acceptance Criteria

- `Flip Match` card が Home に表示され、game route を開ける
- run 全体は 2 分以内に clear または timeout が確定する
- local interaction rule が board 上の copy から読める
- target と live board は narrow viewport でも読める
- run 完了時に `clear time` と `flips` が保存される

## Edge Cases

- run 中以外の tile tap は board state を変えない
- solved round 後は次 round が即座に開き、途中の interaction は残らない
- idle preview は SSR/client で同じ board を出し hydration drift を起こさない

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- primary metric は existing duration formatter を使う
- `flips` は existing count support metric contract に載せる

## Distinction

- `Mirror Match` の mirrored copy ではなく、local propagation rule を読む binary transformation
- `Light Grid` の orthogonal cross rule ではなく、horizontal strip flip が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
