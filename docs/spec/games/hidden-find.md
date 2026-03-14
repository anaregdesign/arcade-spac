# Hidden Find

## Summary

混み合った scene の中から指定 silhouette や motif を見つける high-density visual search game。

## User-Visible Behavior

- scene ごとに target motif が提示される
- 利用者は cluttered board から該当要素を tap する
- wrong tap で time penalty、correct tap で次 scene に進む

## Acceptance Criteria

- full run が 2 分以内
- simply color match に依存しない search variety がある
- Result に scenes cleared と false taps が出る

## Distinction

- Symbol Hunt より scene density と camouflage を強めた search 特化
