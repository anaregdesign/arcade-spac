# Phase Lock

## Summary

`Arcade` に `Phase Lock` を追加する。異なる速度で回る複数 wheel を順に lock し、各 wheel を target band に収めながら full stack を完成させる multi-step timing puzzle とする。

## User Problem

- `Orbit Tap` や `Spinner Aim` は単発 shot timing が中心で、複数 state を順に固定する timing puzzle が不足している
- timing game の中に short-term planning を伴う multi-step lock flow がない

## Users and Scenarios

- 利用者は Home から `Phase Lock` を開き、複数 wheel の phase を順に fixed していきたい
- 利用者は current active wheel の target band を見て、適切な瞬間に lock input を押したい
- 利用者は workspace で `locked wheels`、`timing errors`、`lock progress` を見ながら replay したい

## Scope

- `Phase Lock` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `timing errors` とする
- workspace では lock progress と current wheel state を live 表示し、saved result は shared contract に合わせて primary/support metric に載せる

## Non-Goals

- physics-based spinning bodies
- drag-to-stop interaction
- asynchronous puzzle scripting

## User-Visible Behavior

- idle overlay から run を開始すると、複数 wheel がそれぞれ異なる speed と wobble で回転し始める
- 利用者は current active wheel に対して lock input を押し、marker が target band に入った瞬間だけ固定できる
- miss lock は `timing errors` を増やすが、wheel は回り続ける
- wheel を正しい順序で固定し、full stack が locked になると Result へ遷移する
- Result、profile、rankings では `clear time` と `timing errors` を確認できる

## Acceptance Criteria

- `Phase Lock` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- wheel が 2 個以上あり multi-step timing になる
- workspace 上で `locked wheels`、`timing errors`、current active wheel が visible に更新される
- Result、profile、rankings では `clear time` と `timing errors` が保存される

## Edge Cases

- run 中以外の lock input は state を変えない
- rapid tap で duplicate lock が起きない

## Constraints and Dependencies

- narrow viewport でも active wheel、target band、locked state の違いが判別できる

## Distinction

- `Orbit Tap` の single gate hit ではなく、複数 wheel を順に凍結する multi-step timing puzzle
- `Spinner Aim` の shot commit ではなく、phase alignment の固定順序が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
