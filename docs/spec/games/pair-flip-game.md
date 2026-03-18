# Pair Flip Game

## Summary

`Arcade` に `Pair Flip` を追加する。伏せられた card を 2 枚ずつ開いて同じ symbol を揃え、全 pair を揃えるまでの time を競う short-session memory game とする。

## User Problem

- memory 系の game がまだ不足しており、反射神経や長時間 puzzle 以外の選択肢が少ない
- 30 秒から 2 分程度で終わる classic rule の game が catalog に欲しい

## Users and Scenarios

- ユーザは board をめくりながら symbol の位置を覚えたい
- ユーザは mismatch を減らしつつ、全 pair を素早く揃えたい
- ユーザは result で clear time と mismatch count を見て replay したい

## Scope

- `Pair Flip` を home、workspace、result、rankings、profile に統合する
- `difficulty` ごとに pair 数を調整する
- primary metric は `clear time`、support metric は `mismatch count` とする

## Non-Goals

- animation-heavy card flip effect の追求
- score streak、combo、perfect memory bonus
- multiplayer turn-taking mode

## User-Visible Behavior

- run 開始後、伏せ card grid が表示される
- 1 回に 2 枚まで card を開ける
- 同じ symbol なら pair が固定され、異なる symbol なら短時間表示後に閉じる
- 全 pair を揃えると result へ自動遷移する
- result、profile、rankings では clear time を best metric として扱い、support metric として mismatch count を見せる

## Acceptance Criteria

- `Pair Flip` card が home に表示される
- touch と mouse の両方で card をめくれる
- mismatch は count され、clear time と一緒に保存される
- pair が揃った card は再度選択できない
- result screen で `clear time` と `mismatch count` を確認できる

## Edge Cases

- 2 枚 open 中は 3 枚目をめくれない
- 同じ card を 2 回続けて tap しても pair 判定に使わない
- board が狭い viewport でも操作 target size を保つ

## Constraints and Dependencies

- mismatch count は support metric として existing result layout に載せる
- save failure 時も mismatch count を recovery draft に保持する

## Links

- Related: [../product-specs.md#game-catalog-expansion](../product-specs.md#game-catalog-expansion)
- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
