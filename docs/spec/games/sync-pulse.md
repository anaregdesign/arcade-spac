# Sync Pulse

## Summary

複数の pulse ring が中心で重なる瞬間に tap して sync させる timing game。

## User-Visible Behavior

- expanding/contracting ring の重なりを見て中心で tap する
- perfect hit、good hit、miss を即時表示する
- wave 数を規定回数 clear すると run 完了になる

## Acceptance Criteria

- 1 run は 2 分以内
- ring speed variation があり、単純な一定周期 tap にならない
- Result に cleared waves と perfect hits が出る

## Distinction

- Orbit Tap の単一 marker 通過ではなく、波形 alignment 判定が主題
