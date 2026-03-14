# Flip Match

## Summary

tile を flip して表裏 pattern を揃え、goal silhouette に一致させる binary state puzzle。

## User-Visible Behavior

- tile は front/back の 2 state を持つ
- 1 tile の flip が隣接 tile にも影響する rule を持つ
- goal pattern と一致すると clear

## Acceptance Criteria

- 1 puzzle あたり短く、run 全体は 2 分以内
- local interaction rule が可視で学習可能
- Result に puzzles cleared と flips used が出る

## Distinction

- Mirror Match の pair equivalence ではなく、board-wide binary transformation
