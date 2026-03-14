# Number Chain Game

## Summary

`Arcade` に `Number Chain` を追加する。shuffled grid に並んだ number を `1` から順に tap し、最後の number まで到達する速度を競う short-session order game とする。

## User Problem

- ルール理解が一瞬で済む `tap in order` 系の game がない
- logic 寄りでありながら、1 分未満で replay しやすい option が欲しい

## Users and Scenarios

- ユーザは board 上の numbers を見て、次に tap すべき number を瞬時に探したい
- ユーザは wrong number を押さずに sequence を完走したい
- ユーザは result で clear time と wrong tap 数を確認したい

## Scope

- `Number Chain` を home、workspace、result、rankings、profile に統合する
- `difficulty` ごとに grid size と最大 number を調整する
- primary metric は `clear time`、support metric は `wrong taps` とする

## Non-Goals

- drag gesture による連続入力
- negative number、alphabet、equation など別ルール variation
- daily challenge の導入

## User-Visible Behavior

- run 開始後、board に shuffled number grid が表示される
- ユーザは現在必要な next number を status と board の両方で確認できる
- 正しい number を tap すると progress が進む
- 間違った number を tap すると `wrong taps` が増えるが、そのまま続行できる
- 最後の number を tap すると result へ自動遷移する

## Acceptance Criteria

- `Number Chain` が home から起動できる
- board は difficulty に応じた number count を表示する
- correct tap で progress が 1 つ進み、wrong tap で progress は進まない
- result screen で `clear time` と `wrong taps` を確認できる
- profile と rankings に `Number Chain` の best time が表示される

## Edge Cases

- すでに消化済みの number を tap しても再進行しない
- wrong tap count は completed run に保存される
- narrow viewport でも grid 全体を横 scroll なしで操作できる

## Constraints and Dependencies

- shared workspace card と board overlay pattern を再利用する
- primary metric は duration formatter を使う
- support metric は `Mistakes` と同じ result pattern に載せられる構成にする

## Links

- Related: [../product-specs.md#game-catalog-expansion](../product-specs.md#game-catalog-expansion)
- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
