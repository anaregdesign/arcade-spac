# Sync Pulse

## Summary

`Arcade` に `Sync Pulse` を追加する。異なる周期で pulse する ring が重なる瞬間を読んで tap し、wave ごとの sync を積み上げる timing game とする。

## User Problem

- `Orbit Tap` や `Phase Lock` は angle timing が中心で、pulse rhythm の重なりを読む timing challenge が不足している
- 単発 tap だけではなく、連続 wave を rhythm 感覚で刻む short-form timing sprint が欲しい

## Users and Scenarios

- 利用者は Home から `Sync Pulse` を開き、複数 wave を連続で同期させたい
- 利用者は workspace で live pulse を見ながら `perfect`、`good`、`miss` の feedback を即座に読みたい
- 利用者は Result、profile、rankings で `clear time` と `perfect hits` を確認したい

## Scope

- `Sync Pulse` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `perfect hits` とする
- miss は run 中の quality feedback と clean/steady intent 判定に使い、shared result contract の保存値には `perfect hits` と `clear time` を載せる

## Non-Goals

- full song playback
- audio beat matching
- multi-lane rhythm notation

## User-Visible Behavior

- idle overlay から run を開始すると、2 本の pulse ring が異なる周期と位相で広がったり縮んだりし始める
- 利用者は ring の gap が最小になった瞬間に central sync pad を tap し、`perfect`、`good`、`miss` の判定を受ける
- `perfect` と `good` は current wave を clear して次の wave を開き、`perfect` のみ `perfect hits` を増やす
- `miss` は run を止めないが、pulse は継続し、miss count が internal quality tracking に積まれる
- 規定 wave を完了すると Result へ遷移し、Result、profile、rankings では `clear time` と `perfect hits` を確認できる

## Acceptance Criteria

- `Sync Pulse` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- wave ごとに pulse speed または phase variation があり、単純な一定周期 tap にならない
- workspace 上で current wave、`perfect hits`、last judgment、time left が visible に更新される
- Result、profile、rankings では `clear time` と `perfect hits` が保存される

## Edge Cases

- run 中以外の tap は state を変えない
- rapid tap で duplicate wave clear が起きない

## Constraints and Dependencies

- narrow viewport でも dual pulse ring と tap target が重なりすぎず readable である

## Distinction

- `Orbit Tap` の single marker hit ではなく、pulse gap の重なり判定が主題
- `Tempo Hold` の hold duration ではなく、single tap で連続 wave を rhythm 同期させる点が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
