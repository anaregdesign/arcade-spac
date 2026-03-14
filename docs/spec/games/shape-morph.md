# Shape Morph

## Summary

shape sequence の変換規則を読み取り、次に来る shape を選ぶ forward prediction puzzle。

## User-Visible Behavior

- run 中に複数の sequence prompt が出る
- 利用者は rotation、scale、cut、mirror などの変換規則を読んで次形を選ぶ
- correct answer で次 prompt に進む

## Acceptance Criteria

- 2 分以内に複数 prompt を解ける
- ruleset が少なくとも 3 種あり、毎回同じ見え方にならない
- Result に solved prompts と wrong answers が出る

## Distinction

- Pattern Echo の記憶再現ではなく、変換規則の推論が中心
