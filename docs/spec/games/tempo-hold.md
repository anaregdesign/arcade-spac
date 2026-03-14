# Tempo Hold

## Summary

button を押し続け、狙った長さで release して target tempo に合わせる hold timing game。

## User-Visible Behavior

- target duration が run 中に変わる
- 利用者は press and hold して、狙いの timing で離す
- release 差分が小さいほど高評価になる

## Acceptance Criteria

- hold/release の duration 判定が visible
- round 制で 2 分以内に完結する
- Result に release accuracy と rounds completed が出る

## Distinction

- tap moment ではなく hold duration を primary interaction にする
