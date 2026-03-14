# Position Lock

## Summary

moving token 群の最終停止位置を記憶し、同じ位置へ再配置する spatial memory game。

## User-Visible Behavior

- tokens が短時間 move した後に消える
- 利用者は ghost board 上へ token を元の停止位置に置く
- round ごとに token count や motion complexity が増える

## Acceptance Criteria

- 2 分以内で完結
- board occupancy と final placement accuracy が visible
- Result に exact placements と near misses が出る

## Distinction

- Path Recall の経路記憶ではなく、終点配置の spatial memory に集中する
