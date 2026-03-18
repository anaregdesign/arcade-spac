# Tap Safe

## Summary

`Arcade` に `Tap Safe` を追加する。大量に湧く object の中から safe target だけを素早く tap し、hazard を避けながら goal hit count を満たす visual reflex sprint とする。

## User Problem

- `Symbol Hunt` は persistent board なので、短い判断 window で safe / hazard を切り分ける reflex pressure が弱い
- catalog に high-pressure filtering を主題にした short reflex game がない

## Users and Scenarios

- 利用者は Home から `Tap Safe` を開き、短時間しか見えない target wave を素早く処理したい
- 利用者は hazard を避けながら safe target だけを tap して goal hit count を満たしたい
- 利用者は workspace で `safe hits`、`hazard taps`、`accuracy` を見ながら replay したい

## Scope

- `Tap Safe` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `penalties` とする
- workspace では `safe hits`、`hazard taps`、`accuracy` を live に見せ、saved result は shared contract に合わせて primary/support metric に載せる

## Non-Goals

- drag gesture input
- endless survival mode
- audio-only rhythm judgment

## User-Visible Behavior

- idle overlay から run を開始すると、safe target と hazard object が short wave 単位で board に表示される
- 利用者は safe target だけを tap して hit count を伸ばす
- hazard tap は large penalty、wave 終了までに残した safe target は small penalty として加算される
- wave は連続して切り替わり、goal hit count に達すると Result へ遷移する
- Result、profile、rankings では `clear time` と `penalties` を確認できる

## Acceptance Criteria

- `Tap Safe` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- safe / hazard differentiation が color だけに依存しない
- workspace 上で `safe hits`、`hazard taps`、`accuracy` が visible に更新される
- Result、profile、rankings では `clear time` と `penalties` が保存される

## Edge Cases

- wave 切替後に stale cell を tap しても next wave state を壊さない
- cleared safe target の再 tap は score や penalty を二重加算しない

## Constraints and Dependencies

- touch target は desktop と mobile の両方で十分な大きさを保つ

## Distinction

- `Symbol Hunt` の persistent board 検索ではなく、短い判断 window と high-pressure filtering が主題
- `Target Trail` の one-target chase ではなく、safe / hazard discrimination を扱う

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
