# Cascade Flip

## Summary

falling card stream の中から記憶した順に correct card を flip していく dynamic memory game。

## User-Visible Behavior

- board 上の cards が落下または段階移動する
- 利用者は memorized order に従って対象 card を選ぶ
- wrong flip や見失いで penalty が入る

## Acceptance Criteria

- 2 分以内で終わる
- static pair memory と違い board state が動く
- Result に cards resolved と misses が出る

## Distinction

- Pair Flip と異なり board motion が memory pressure を作る
