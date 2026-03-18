# Spinner Aim

## Summary

`Arcade` に `Spinner Aim` を追加する。回転する launcher の角度を見極めて projectile を target ring へ通し、hazard arc を避けながら hit goal を満たす angular timing sprint とする。

## User Problem

- `Precision Drop` は vertical timing なので、angle-based shot timing を主題にした game が不足している
- `Orbit Tap` は marker 通過 tap で、fire timing と hazard avoidance を組み合わせた shot game がない

## Users and Scenarios

- 利用者は Home から `Spinner Aim` を開き、rotating launcher の角度を見て shot timing を合わせたい
- 利用者は target arc に合わせて fire し、hazard arc を避けながら goal hit count を満たしたい
- 利用者は workspace で `targets hit`、`hazard hits`、`accuracy` を見ながら replay したい

## Scope

- `Spinner Aim` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `bad shots` とする
- workspace では `targets hit`、`hazard hits`、`accuracy` を live 表示し、saved result は shared contract に合わせて primary/support metric に載せる

## Non-Goals

- charge meter
- physics-heavy ricochet simulation
- free-aim drag control

## User-Visible Behavior

- idle overlay から run を開始すると、launcher が一定または変速で rotate し始める
- 利用者は fire input を押して current angle で shot を確定する
- target arc hit で success、hazard arc hit と off-target shot で penalty が入る
- target を hit すると次の target / hazard arrangement が開き、goal hit count に達すると Result へ遷移する
- Result、profile、rankings では `clear time` と `bad shots` を確認できる

## Acceptance Criteria

- `Spinner Aim` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- charge なしの shot timing が主題になっている
- workspace 上で `targets hit`、`hazard hits`、`accuracy` が visible に更新される
- Result、profile、rankings では `clear time` と `bad shots` が保存される

## Edge Cases

- run 中以外の fire input は state を変えない
- tap spam で shot count が異常に増えない

## Constraints and Dependencies

- narrow viewport でも launcher、target arc、hazard arc の位置関係が判別できる

## Distinction

- `Precision Drop` の vertical timing ではなく angular shot timing を扱う
- `Orbit Tap` の pass-through tap ではなく、shot commit と hazard avoidance の組み合わせが主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
