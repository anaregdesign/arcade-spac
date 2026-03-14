# Sum Grid

## Summary

small grid の row/column target sum を満たすよう number tile を配置する quick arithmetic puzzle。

## User-Visible Behavior

- grid と target sums が提示される
- 利用者は candidate numbers を空欄へ置く
- 全行列条件が一致すると clear

## Acceptance Criteria

- 2 分以内に複数 puzzle が遊べる
- Quick Sum の単発演算ではなく、配置制約付き arithmetic reasoning
- Result に solved grids と hintless clears が出る

## Distinction

- arithmetic answer speed ではなく、grid constraint solving が主題
