# Pattern Echo Game

## Summary

`Arcade` に `Pattern Echo` を追加する。flash された pad の sequence を watch し、同じ順番で pad を再現することで clear を目指す short-session memory / rhythm game とする。

## User Problem

- 短時間で完結するリズム感・記憶力系の game がラインナップにない
- 視覚パターンを短期記憶して再現する遊び方は他 game とは異なる体験を提供できる
- 1 run が 20 秒から 90 秒程度で終わり、replay しやすい option が欲しい

## Users and Scenarios

- ユーザは home から `Pattern Echo` を選び、flashing sequence を watch してから、同じ順で pad を tap したい
- ユーザは間違えた tap を記録されながらも sequence を完走したい
- ユーザは result で clear time と wrong input 数を確認して replay したい

## Scope

- `Pattern Echo` を home、workspace、result、rankings、profile に統合する
- `difficulty` ごとに grid size、sequence length、time limit を調整する
- primary metric は `clear time`、support metric は `wrong inputs` とする
- watch phase（sequence 表示）と input phase（sequence 再入力）の 2 フェーズで run を構成する

## Non-Goals

- sequence が徐々に長くなる infinite / escalation mode
- daily challenge や preset sequence の導入
- multi-player や co-op mode

## User-Visible Behavior

- idle overlay から run を開始すると watch phase が始まり、pad が sequence 順に 1 つずつ flash する
- sequence の全 pad が flash し終わると input phase に切り替わり、pad が tappable になる
- 正しい pad を tap すると sequence の progress が 1 つ進む
- 間違った pad を tap すると `wrong inputs` が増えるが run は続行できる
- sequence を最後まで正しく再現すると result へ自動遷移する
- timer が切れた場合は `failed` として result へ自動遷移する
- result、profile、rankings では `clear time` と `wrong inputs` を確認できる

## Acceptance Criteria

- `Pattern Echo` card が home に表示され、game route を開ける
- watch phase では pad が sequence 順に flash し、player はまだ tap できない
- input phase では pad が tappable になり、sequence を再現できる
- wrong tap は `wrong inputs` として記録されるが run は止まらない
- sequence を完走すると `clear time` と `wrong inputs` が保存される
- timer expired で `failed` として primary metric が保存される
- result screen で `clear time` と `wrong inputs` を確認できる
- profile と rankings に `Pattern Echo` の best time が表示される

## Edge Cases

- run 開始前の pad tap は board state を変えない
- watch phase 中の pad tap は受け付けない
- timer は run 開始から clear または timeout まで継続する
- narrow viewport でも pad grid と legend が同一画面で操作できる

## Constraints and Dependencies

- shared workspace card と board overlay pattern を再利用する
- primary metric は existing duration formatter を使う
- support metric は `wrong inputs` として `mistakeCount` に保存する
- save failure 時も `wrong inputs` を recovery draft に保持する

## Links

- Related: [../product-specs.md#game-catalog-expansion](../product-specs.md#game-catalog-expansion)
- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
