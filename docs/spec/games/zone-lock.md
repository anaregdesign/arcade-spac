# Zone Lock

## Summary

board を複数 zone に分け、zone rule を同時に満たすよう token を配置する compact logic puzzle。

## User-Visible Behavior

- 各 zone に distinct rule が表示される
- 利用者は token を移動し、全 zone 条件を同時に成立させる
- all-zones locked で clear

## Acceptance Criteria

- 2 分以内に複数 puzzle を遊べる
- zone interaction があり独立 solve で終わらない
- Result に locks completed と resets used が出る

## Distinction

- Sudoku の全体制約とは異なり、局所 zone constraints の干渉が主題
