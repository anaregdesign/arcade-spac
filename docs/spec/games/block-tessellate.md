# Block Tessellate

## Summary

`Arcade` に `Block Tessellate` を追加する。falling piece を rotate と lateral move で制御し、target silhouette を順番に埋め切る gravity-driven spatial placement sprint とする。

## User Problem

- 現在の spatial game は static transform や memory reconstruction が中心で、gravity による falling placement pressure が不足している
- logic と timing が混ざる placement game を catalog に増やしたい

## Users and Scenarios

- 利用者は Home から `Block Tessellate` を開き、falling piece を target silhouette の gap に素早く収めたい
- 利用者は current pattern の silhouette、next piece preview、misdrops を見ながら run を続けたい
- 利用者は Result、profile、rankings で `clear time` と `misdrops` を確認したい

## Scope

- `Block Tessellate` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `misdrops` とする
- workspace では active pattern、falling piece、next piece、filled coverage、misdrops を live 表示する

## Non-Goals

- endless falling sandbox
- line-clear scoring game
- freeform piece editor

## User-Visible Behavior

- idle overlay から run を開始すると、target silhouette を持つ compact board と最初の falling piece が表示される
- 利用者は rotate、left、right、drop の touch-safe controls で piece を動かし、silhouette の空きに合わせて lock する
- piece が正しい位置で lock されると silhouette coverage が進み、次の piece が spawn する
- piece が silhouette 外や不正な cell に lock された場合は `misdrops` が増え、current pattern はそのまま続くか、overflow 時は current pattern が reset される
- pattern を埋め切ると次の silhouette に進み、規定 pattern 数を完了すると Result に遷移する
- timer が切れた場合は fail として Result に遷移し、workspace では current pattern の充填率と misdrops を確認できる

## Acceptance Criteria

- `Block Tessellate` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- piece rotation、lateral move、gravity lock の 3 要素が visible に機能する
- silhouette shape と piece set に variation があり、単純な同型反復にならない
- Result、profile、rankings では `clear time` と `misdrops` が保存される

## Edge Cases

- run 中以外の movement input は state を変えない
- spawn space が塞がっている場合は current pattern の failure として扱う
- rapid rotate や drop でも duplicate lock が起きない
- narrow viewport でも board、preview、movement controls が touch-safe に収まる

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic piece queue と Playwright selector を board、piece、movement action に付ける
- pointer と touch の両方で操作を完結できるようにする

## Distinction

- `Tile Shift` や `Swap Solve` の static board transform ではなく、gravity と lock timing を伴う falling placement が主題
- `Box Fill` の static packing ではなく、連続 spawn 圧力の中で silhouette を埋める点が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
