# Intercept Ball

## Summary

`Arcade` に `Intercept Ball` を追加する。wall で bounce する ball の landing path を読み、catch pad を target zone へ動かして intercept する prediction-reflex game とする。

## User Problem

- `Bounce Angle` の shot planning と別に、moving object を予測して受ける reactive game が不足している
- reflex game の中でも path prediction が主題の family を増やしたい

## Users and Scenarios

- 利用者は Home から `Intercept Ball` を開き、ball の bounce path を読んで catch pad を適切な zone に合わせたい
- 利用者は workspace で current shot、target intercept zone、successful intercepts を見ながら連続 shot をさばきたい
- 利用者は Result、profile、rankings で `successful intercepts` と `miss streak` を確認したい

## Scope

- `Intercept Ball` を home、workspace、result、rankings、profile に統合する
- primary metric は `successful intercepts`、support metric は `miss streak` とする
- workspace では ball path、catch pad、target intercept zone、next shot preview を live 表示する

## Non-Goals

- endless pong rally
- opponent AI
- freeform physics sandbox

## User-Visible Behavior

- idle overlay から run を開始すると、ball が deterministic な bounce path で field を進む
- 利用者は catch pad を left / center / right などの bounded intercept zone に移動し、指定 zone 内で ball を受ける
- correct intercept は `successful intercepts` を増やし、次の shot に進む
- miss や wrong zone intercept は `miss streak` を増やし、run pressure が上がる
- 規定 intercept 数に達すると clear となり Result に遷移する
- timer が切れるか miss streak が上限に達すると fail として Result に遷移する

## Acceptance Criteria

- `Intercept Ball` card が Home に表示され、game route を開ける
- 1 run は 2 分以内で clear または fail が確定する
- ball bounce prediction、catch pad reposition、target intercept zone の 3 要素が visible に機能する
- workspace 上で current shot、successful intercepts、miss streak、next zone cue が更新される
- Result、profile、rankings では `successful intercepts` と `miss streak` が保存される

## Edge Cases

- run 中以外の pad movement input は state を変えない
- shot resolution 中に duplicate intercept が受け付けられない
- same shot seed は deterministic な bounce path を返す
- narrow viewport でも field、pad、target zone が見切れず touch-safe に保たれる

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を catch zone、pad position、ball state、intercept outcome に付ける
- movement path は prediction game として読める速度に保つ

## Distinction

- `Bounce Angle` の pre-shot geometry planning ではなく、moving object への reactive intercept が主題
- `Obstacle Stream` の lane avoidance ではなく、incoming object を指定 zone で受ける prediction reflex が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
