# Spot Change

## Summary

2 つの短い scene の差分を時間内に見抜いて選ぶ comparison game。

## User-Visible Behavior

- original と changed scene が交互または並列で表示される
- 利用者は changed element を tap する
- round success ごとに差分数や distractor が増える

## Acceptance Criteria

- 2 分以内で完結
- difference type が位置ずれ、向き、欠落、色差など複数ある
- Result に found changes と misses が出る

## Distinction

- pure target hunt ではなく before/after comparison が core
