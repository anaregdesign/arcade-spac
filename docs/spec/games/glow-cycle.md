# Glow Cycle

## Summary

複数 node の glow rhythm を読み、cycle completion の瞬間に correct node を選ぶ visual rhythm puzzle。

## User-Visible Behavior

- nodes が異なる周期で pulse する
- 利用者は target cycle が揃う瞬間に指定 node を tap する
- correct tap で cycle clear、wrong tap で penalty が入る

## Acceptance Criteria

- 2 分以内の multi-round run
- 周期の重なりを読む必要があり単純反復にならない
- Result に cycles cleared と mistimed taps が出る

## Distinction

- audio beat ではなく multi-node visual cycle synchronization が主題
