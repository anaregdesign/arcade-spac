# Glow Cycle

## Summary

`Arcade` に `Glow Cycle` を追加する。複数 node が異なる pulse cycle で明滅する中、指定された target node を board 全体の glow が揃う瞬間に tap して cycle を積み上げる visual rhythm puzzle とする。

## User Problem

- `Sync Pulse` は central pad への single tap が中心で、複数 target から正しい node を選ぶ visual rhythm game が不足している
- audio に頼らず、screen 上の glow timing だけで rhythm を読む短時間 game が catalog に欲しい

## Users and Scenarios

- 利用者は Home から `Glow Cycle` を開き、pulse する node grid を見て target node を正しい瞬間に tap したい
- 利用者は workspace で current target、sync window、mistimed taps を読みながら run を続けたい
- 利用者は Result、profile、rankings で `clear time` と `mistimed taps` を確認したい

## Scope

- `Glow Cycle` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `mistimed taps` とする
- workspace では node pulse、target node、current sync window、cycle progress を live 表示する

## Non-Goals

- audio beat matching
- drag interaction や hold interaction
- freeform sandbox lighting editor

## User-Visible Behavior

- idle overlay から run を開始すると、4 個以上の node がそれぞれ異なる pulse speed と phase で glow し始める
- 各 cycle では 1 つの target node が highlighted され、利用者は board 全体の glow が揃う `good` または `perfect` window 中にその node だけを tap する
- `perfect` または `good` で target node を tap すると current cycle が clear され、次の cycle では target node と pulse pattern が更新される
- target 以外の node を tap した場合、または sync window 外で tap した場合は `mistimed taps` が増えるが、run は継続する
- 規定 cycle 数を完了すると Result に遷移し、Result、profile、rankings では `clear time` と `mistimed taps` を確認できる
- timer が切れた場合は fail として Result に遷移し、未完了 cycle 数は workspace 上で確認できる

## Acceptance Criteria

- `Glow Cycle` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- node は 4 個以上あり、target node の選択と multi-node cycle synchronization の両方を読む必要がある
- workspace 上で current target、cycles cleared、last judgment、mistimed taps、time left が visible に更新される
- Result、profile、rankings では `clear time` と `mistimed taps` が保存される

## Edge Cases

- run 中以外の tap は state を変えない
- rapid tap で duplicate cycle clear が起きない
- narrow viewport でも target node の強調と tap target size が維持される

## Constraints and Dependencies

- pointer と touch の両方で主要操作を完結できるようにする

## Distinction

- `Sync Pulse` の single central pad hit ではなく、複数 node から正しい target を選ぶ visual rhythm puzzle
- `Phase Lock` の sequential lock ではなく、board 全体の glow synchronization を読む point-in-time selection が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
