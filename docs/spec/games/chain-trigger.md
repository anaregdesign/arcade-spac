# Chain Trigger

## Summary

node の発火順と距離を設計して、最少 input で全 node を連鎖起動する chain planning puzzle。

## User-Visible Behavior

- board 上に trigger radius を持つ node が配置される
- 利用者は start node を選ぶか limited toggles を行って連鎖条件を整える
- 全 node 点灯で clear になる

## Acceptance Criteria

- 2 分以内で解ける compact puzzle set
- deterministic chain resolution が visible
- Result に puzzles solved と extra triggers used が出る

## Distinction

- Light Grid の局所 toggle ではなく、propagation network planning に寄せる
