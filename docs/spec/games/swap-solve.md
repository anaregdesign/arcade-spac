# Swap Solve

## Summary

限られた swap 回数で board 上の disorder を解消し target arrangement に戻す optimization puzzle。

## User-Visible Behavior

- shuffled board と target state が同時に見える
- 利用者は limited swaps で target に近づける
- exact solve で clear、未達でも proximity score を返す

## Acceptance Criteria

- 2 分以内の short puzzle run
- move budget があり brute force repetition を避ける
- Result に puzzles solved と swap efficiency が出る

## Distinction

- Tile Shift の連続移動ではなく、limited swap optimization が core
