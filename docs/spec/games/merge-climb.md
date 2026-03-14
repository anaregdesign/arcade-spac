# Merge Climb

## Summary

`Arcade` に `Merge Climb` を追加する。small value tile を slide して merge し、board が埋まる前に goal threshold へ到達する compact growth-strategy puzzle とする。

## User Problem

- current catalog には move efficiency を評価する growth puzzle が不足している
- endless ではない 2048-style sprint を加え、logic と pressure の中間にある family を増やしたい

## Users and Scenarios

- 利用者は Home から `Merge Climb` を開き、少ない move で target value に到達したい
- 利用者は workspace で max value、remaining space、move count を見ながら merge plan を立てたい
- 利用者は Result、profile、rankings で `clear time` と `moves used` を確認したい

## Scope

- `Merge Climb` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `moves used` とする
- workspace では board、next spawn pressure、current max value、remaining space を visible にする

## Non-Goals

- endless score chase
- random power-up economy
- large-board sandbox mode

## User-Visible Behavior

- idle overlay から run を開始すると、small board に value tile が配置される
- 利用者は direction input で tile を slide し、same value 同士を merge する
- every move の後に新しい tile が spawn し、remaining space pressure が上がる
- goal threshold value に到達すると clear になり Result に遷移する
- board が埋まり、もう merge できない状態になると fail になる
- Result、profile、rankings では `clear time` と `moves used` を確認できる

## Acceptance Criteria

- `Merge Climb` card が Home に表示され、game route を開ける
- 1 run は 2 分以内で clear または fail が確定する
- merge growth、space pressure、move efficiency の 3 要素が visible に機能する
- workspace 上で current max value、moves used、remaining empty cells が更新される
- Result、profile、rankings では `clear time` と `moves used` が保存される

## Edge Cases

- run 中以外の direction input は state を変えない
- same move state に対する spawn は deterministic verification が可能な bounded sequence である
- duplicate merge が 1 move 内で重複発生しない
- narrow viewport でも swipe or button controls が touch-safe に機能する

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を board tile value、direction action、remaining space、goal threshold state に付ける
- move resolution は user が追える速度で反映される

## Distinction

- `Stack Sort` や `Tile Shift` の rearrangement ではなく、numeric growth planning が主題
- `Bubble Spawn` の live pressure ではなく、turn-based space pressure と merge efficiency が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
