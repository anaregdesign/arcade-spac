# Color Census

## Summary

短時間表示される mosaic の色分布を見て、最多色や指定 count を答える rapid estimation game。

## User-Visible Behavior

- mosaic が短く表示された後に query が出る
- 利用者は most frequent color や specific count relation を答える
- query variation で counting の切り口が変わる

## Acceptance Criteria

- 1 run は 2 分以内
- exact count と relative majority の両方を扱う
- Result に correct answers と average response time が出る

## Distinction

- Color Sweep の局所判別ではなく、全体分布の短期集計が主題
