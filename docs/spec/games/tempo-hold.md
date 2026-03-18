# Tempo Hold

## Summary

`Arcade` に `Tempo Hold` を追加する。target hold duration を読み、press and hold したあと狙った長さで release して round を重ねる hold timing game とする。

## User Problem

- 既存の timing game は single tap timing が中心で、hold duration を読む game が不足している
- 利用者は `press` と `release` の 2 段階 input で tempo 感覚を測る game も遊びたい

## Users and Scenarios

- 利用者は Home から `Tempo Hold` を開き、target hold duration に合わせて round を進めたい
- 利用者は workspace 上で current target、live hold meter、last release judgment を見ながら run を進めたい
- 利用者は Result、profile、rankings で `clear time` と `perfect releases` を確認したい

## Scope

- `Tempo Hold` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `perfect releases` とする
- round progress、target duration、last release judgment は workspace と finish copy で見せ、shared result contract には `clear time` と `perfect releases` を載せる

## Non-Goals

- full rhythm track playback
- drag-based slider control
- multi-lane note chart

## User-Visible Behavior

- idle overlay から run を開始すると current round の target hold duration が表示される
- 利用者は central hold pad を press し続け、meter が target zone に入る timingで release する
- release ごとに `perfect`、`good`、`miss` の judgment が即時表示され、次 round の target duration が開く
- round を重ねて規定数に到達すると Result へ遷移する
- Result、profile、rankings では `clear time` と `perfect releases` を確認できる

## Acceptance Criteria

- `Tempo Hold` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- round ごとに target hold duration が変化し、一定の hold 反復だけでは安定しない
- workspace 上で current round、target duration、current hold meter、last judgment が visible に更新される
- Result、profile、rankings では `clear time` と `perfect releases` が保存される

## Edge Cases

- run 中以外の press/release は state を変えない
- holding 中の duplicate start が起きない

## Constraints and Dependencies

- narrow viewport でも target zone と hold meter が readable で、primary button が押しやすい

## Distinction

- `Orbit Tap` や `Sync Pulse` の tap timing ではなく、hold duration の release judgment を primary interaction にする
- `Tempo Weave` の dual-lane split attention ではなく、single target duration の precision hold を主題にする

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
