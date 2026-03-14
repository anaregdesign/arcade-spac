# Icon Chain

## Summary

一瞬見えた icon 群の出現順を partial clue から復元して選ぶ memory-inference puzzle。

## User-Visible Behavior

- icons が短時間だけ提示され、その後 clue state に変わる
- 利用者は first-to-last の出現順を復元して順に選ぶ
- round が進むほど icon count と ambiguity が増える

## Acceptance Criteria

- 1 run は 2 分以内
- pure pair matching にならず、order recall が必要
- Result に longest chain と wrong picks が出る

## Distinction

- Pair Flip の pair memory ではなく、order reconstruction と clue inference を組み合わせる
