# Tempo Weave

## Summary

2 本の independent beat lane を交互に処理し、split attention で streak を維持する dual-lane rhythm game。

## User-Visible Behavior

- left/right lane で異なる tempo の prompt が流れる
- 利用者は lane ごとに正しい input を合わせる
- streak が続くほど density が上がる

## Acceptance Criteria

- 2 分以内で run 完了
- single-lane rhythm と異なる dual-attention challenge を持つ
- Result に streak、lane accuracy、misses が出る

## Distinction

- Beat Match の straight combo に対して、複線処理の負荷を主題にする
