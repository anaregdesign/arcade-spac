# Rotate Align

## Summary

複数 ring または tile group を rotate して pathway を一筆接続する rotation puzzle。

## User-Visible Behavior

- 利用者は section ごとに rotate 操作を行う
- start から end まで line がつながると clear
- puzzle が進むほど rotate group が増える

## Acceptance Criteria

- 2 分以内に複数 puzzle を遊べる
- static swap ではなく rotation-specific interaction を持つ
- Result に clears と rotations used が出る

## Distinction

- Tile Shift の swap/slide ではなく group rotation に特化
