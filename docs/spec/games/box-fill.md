# Box Fill

## Summary

与えられた piece を overlap なしで box に詰め切る packing puzzle。

## User-Visible Behavior

- 利用者は piece を drag or select-rotate して box に置く
- 全マスを無駄なく埋めると clear
- puzzle ごとに box shape と piece set が変わる

## Acceptance Criteria

- 2 分以内で複数 puzzle を解ける
- placement retry が軽く、テンポを損なわない
- Result に puzzles solved と placement errors が出る

## Distinction

- Block Tessellate の falling action ではなく、static packing planning
