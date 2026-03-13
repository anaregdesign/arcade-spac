# Minesweeper Game

## Summary

`Arcade` の phase 1 lineup として `Minesweeper` を提供する。safe cell をすべて開くまでの clear time を競い、mine を踏んだ run は failed result として履歴に残しつつ rankings 対象外にする。

## User Problem

- classic な logic board game を、他ゲームと同じ app shell と result flow で繰り返し遊びたい
- desktop と touch の両方で、open と flag を迷わず使い分けたい
- clear time だけでなく、mistake の有無も result と profile で確認したい

## Users and Scenarios

- ユーザは home から `Minesweeper` を選び、最初の 1 手からすぐ board に集中したい
- ユーザは reveal 済みの clue number を使って safe cell を開き、mine 位置を推測したい
- ユーザは desktop では secondary click、touch では flag mode を使って mine 候補を mark したい
- ユーザは clear 後に clear time と mistake count を確認し、failed run でも何が起きたかを理解して replay したい

## Scope

- `Minesweeper` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `Mistakes` とする
- live board では open cell と flag cell の両方を first-class control として提供する
- mine を開いた run は failed result として保存し、履歴には残すが rankings と total points から除外する

## Non-Goals

- custom board size や mine count の自由入力
- chord click、advanced solver assist、auto-solve などの expert-only shortcut
- dedicated tutorial route や onboarding overlay

## User-Visible Behavior

- home で `Minesweeper` card が他ゲームと同じ grid pattern で表示される
- game screen では `difficulty` を選び、`Start run` するか最初の cell を開くことで board を開始できる
- closed cell は primary click または tap で開き、desktop では secondary click、touch では `Flag mode` で mine 候補を mark できる
- revealed number は隣接する mine 数を示し、safe cell をすべて開くと result screen へ自動遷移する
- mine を踏んだ run は failed result として直ちに終了し、履歴には残るが rankings 対象外になる
- result、profile、rankings では `clear time` を代表記録として扱い、support metric として `Mistakes` を確認できる

## Acceptance Criteria

- ユーザは home から `Minesweeper` を起動できる
- mouse と touch の両方で board を完了できる
- touch device では secondary click に依存せず flag 操作へ到達できる
- clear run は `clear time` と `Mistakes` を保存する
- failed run は result screen を開くが、rankings と total points の対象外として表示される

## Edge Cases

- run 開始前の flag や open は live result を保存しない
- route を離れても進行中 run を自動で clear や fail として保存しない
- already opened cell を再操作しても progress や score を重複加算しない
- narrow viewport でも board、flag 操作、主要 actions が同一画面で使える

## Constraints and Dependencies

- shared workspace、result screen、pending-save recovery flow を再利用する
- primary metric は duration formatter を使う
- support metric は `mistakeCount` を `Mistakes` として表示する
- failed run は history only とし、`leaderboardEligible` を付けない

## Links

- Related: [../product-requirements.md](../product-requirements.md)
- Flow: [../screen-flow.md](../screen-flow.md)