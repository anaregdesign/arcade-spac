# Beat Match

## Summary

`Arcade` に `Beat Match` を追加する。visual beat cue に合わせて lane button を timing よく叩き、combo を伸ばしながら hit goal を達成する rhythm game とする。

## User Problem

- catalog に beat cadence を主題にした lane timing game がない
- 既存 timing game は単発判定中心で、連続 combo pressure が薄い

## Users and Scenarios

- 利用者は Home から `Beat Match` を開き、beat cue に合わせて正しい lane を叩きたい
- 利用者は workspace 上で combo、accuracy、active lane、timing judgment を見ながら run を進めたい
- 利用者は Result、profile、rankings で `clear time` と `max combo` を確認したい

## Scope

- `Beat Match` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `max combo` とする
- accuracy と miss count は workspace と finish copy で見せ、shared result contract には `clear time` と `max combo` を載せる

## Non-Goals

- licensed music playback
- audio latency compensation tuning
- multi-song chart selection

## User-Visible Behavior

- run を開始すると 3 lane の beat prompt が一定の cadence で流れ、current active lane と timing track が表示される
- 利用者は beat が hit zone に入った瞬間に対応 lane button を tap し、`perfect`、`good`、`miss` の判定を受ける
- `perfect` と `good` は hit progress を進めて combo を伸ばし、`miss` は combo を切る
- hit goal に到達すると Result へ遷移し、Result、profile、rankings では `clear time` と `max combo` を確認できる

## Acceptance Criteria

- 1 run が 2 分以内に終わる
- combo、accuracy、miss、active lane が visible に表示される
- Result、profile、rankings で `clear time` と `max combo` が保存される

## Edge Cases

- run 中以外の lane tap は state を変えない
- late note は miss として処理されるが run 全体は継続する
- idle preview は hydration drift を起こさない

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を board root と lane button に付け、active lane、current timing window、combo state を読めるようにする
- narrow viewport でも 3 lane button と timing track が readable で tap-safe である

## Distinction

- `Pattern Echo` の順序再現ではなく、連続 timing 精度と combo 維持が主題
- `Sync Pulse` の single sync pad ではなく、lane selection を伴う rhythm timing が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
