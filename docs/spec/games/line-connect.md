# Line Connect

## Summary

paired node 同士を線でつなぎ、線の交差を避けながら board を完成させる connection puzzle。

## User-Visible Behavior

- same-mark node pairs が board に置かれる
- 利用者は drag で path を描いて pair を接続する
- 全 pair 接続かつ no-cross で clear

## Acceptance Criteria

- 2 分以内に複数 puzzle が進む
- path overwrite や undo が軽快に動く
- Result に puzzles solved と path corrections が出る

## Distinction

- Path Recall の再現ではなく、即興 path construction logic
