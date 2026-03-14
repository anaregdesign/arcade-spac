# Bounce Angle

## Summary

`Arcade` に `Bounce Angle` を追加する。fixed launcher から ball を発射し、wall reflection を読んで goal pocket へ導く one-shot ricochet geometry puzzle とする。

## User Problem

- reflex game は増えてきたが、reflection geometry を読む one-shot planning puzzle が不足している
- `Spinner Aim` や `Phase Lock` とは違う、trajectory prediction が主題の action puzzle を catalog に加えたい

## Users and Scenarios

- 利用者は Home から `Bounce Angle` を開き、wall layout と hazard を見て最適な bank shot を選びたい
- 利用者は workspace で aim angle、remaining shot count、last bounce path を確認しながら puzzle を解きたい
- 利用者は Result、profile、rankings で `clear time` と `shots used` を確認したい

## Scope

- `Bounce Angle` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `shots used` とする
- workspace では puzzle board、launcher angle、goal pocket、hazard、last path trace を visible にする

## Non-Goals

- freehand physics sandbox
- continuous drag aim editor
- multi-ball chaos simulation

## User-Visible Behavior

- idle overlay から run を開始すると、compact ricochet puzzle が表示される
- 利用者は touch-safe aim controls で launcher angle を刻みながら調整し、`Launch` で 1 回だけ ball を撃つ
- ball は wall で反射し、deterministic な path を辿る
- ball が goal pocket に入ると current puzzle が clear され、次の layout に進む
- ball が hazard や dead end に落ちた場合は `shots used` が増え、利用者は angle を調整して再挑戦できる
- 規定 puzzle 数を完了すると Result に遷移し、Result、profile、rankings では `clear time` と `shots used` を確認できる
- timer が切れた場合は fail として Result に遷移する

## Acceptance Criteria

- `Bounce Angle` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- direct shot では届かず、1 回以上の bank shot が必要な puzzle を含む
- workspace 上で aim angle、last path trace、goal pocket、hazard が readable に表示される
- Result、profile、rankings では `clear time` と `shots used` が保存される

## Edge Cases

- run 中以外の launch input は state を変えない
- shot の resolution 中は aim controls が重複反応しない
- narrow viewport でも launcher、wall、goal pocket が見切れず touch-safe に保たれる
- deterministic reflection で同じ angle は常に同じ path になる

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を launcher、launch action、goal state、last path trace に付ける
- reflection は visible に追える速度と path trace を持つ

## Distinction

- `Intercept Ball` の reactive catch ではなく、launch 前の geometry planning が主題
- `Spinner Aim` の moment timing ではなく、ricochet path prediction が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
