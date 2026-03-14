# Gap Rush

## Summary

moving wall の gap に avatar を通し続ける reaction corridor game。

## User-Visible Behavior

- wall pattern が連続で接近する
- 利用者は horizontal move で gap を通す
- miss すると即終了、perfect pass で bonus が入る

## Acceptance Criteria

- full run は 2 分以内
- wall patterns に width/offset variation がある
- Result に walls cleared と perfect passes が出る

## Distinction

- lane dodge より continuous position control が重要
