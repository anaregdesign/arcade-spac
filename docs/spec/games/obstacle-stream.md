# Obstacle Stream

## Summary

左右 lane を切り替えて連続 obstacle を避け続ける reflex survival game。

## User-Visible Behavior

- avatar が前進し、obstacle stream が近づく
- 利用者は left/right input で safe lane へ切り替える
- survive time が伸びるほど speed と density が上がる

## Acceptance Criteria

- 1 run は 2 分以内で必ず終了する difficulty ramp を持つ
- input は瞬時 lane switch に集中する
- Result に survived seconds と near dodges が出る

## Distinction

- Target Trail の追従ではなく、lane risk avoidance に特化
