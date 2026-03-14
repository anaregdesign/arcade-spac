# Block Tessellate

## Summary

falling piece を rotate して board の target tessellation を埋める spatial placement game。

## User-Visible Behavior

- falling piece が 1 つずつ出る
- 利用者は rotate/drop して pattern gap を埋める
- target layout を一定数完成させると clear になる

## Acceptance Criteria

- 2 分以内で clear/fail が決まる
- piece rotation と placement の両方が必要
- Result に patterns completed と misdrops が出る

## Distinction

- Tile Shift や Stack Sort の static transform ではなく、falling placement が core
