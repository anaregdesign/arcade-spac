# Cascade Clear

## Summary

small board 上で one move cascade を最大化して target score に届かせる combo puzzle。

## User-Visible Behavior

- 利用者は 1 手ごとに row/column を選んで trigger する
- chain reaction で block が消えるほど score が伸びる
- 規定手数内で target score に達すると clear

## Acceptance Criteria

- 1 run は 2 分以内
- combo chain が視覚的に追える
- Result に best cascade と final score が出る

## Distinction

- static clear ではなく、chain setup の一手最適化が中心
