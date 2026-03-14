# Zone Lock

## Summary

`Arcade` に `Zone Lock` を追加する。overlapping zone が共有する board cell を toggle し、各 zone の target lock count を同時に満たして全 zone を lock する compact logic puzzle とする。

## User Problem

- `Sudoku` や `Stack Sort` は row や stack の long-form solve が主で、短時間で zone interference を読む local logic puzzle がない
- 1 cell の変更が複数 rule に波及する compact constraint puzzle が不足している

## Users and Scenarios

- 利用者は Home から `Zone Lock` を開き、zone card の target lock count を見ながら board を素早く読みたい
- 利用者は shared cell を toggle して、複数 zone の current count が同時に locked する configuration を作りたい
- 利用者は Result、profile、rankings で `clear time` と `resets used` を確認したい

## Scope

- `Zone Lock` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `resets used` とする
- workspace と finish copy では current round、locked zones、total locked zones を見せる

## Non-Goals

- drag-and-drop token movement
- freeform sandbox editor
- arithmetic-heavy full-grid puzzle

## User-Visible Behavior

- run を開始すると current round の empty board と overlapping zone rule が表示される
- 各 zone card には target lock count、current count、locked/open status が表示される
- 利用者は cell を tap して lock を on/off し、1 回の toggle で複数 zone の current count が更新される
- current round の全 zone が locked すると次 puzzle が即座に読み込まれ、規定 round を完了すると Result へ遷移する
- `Reset board` は current round の board を empty に戻し、`resets used` を加算する
- Result、profile、rankings では `clear time` と `resets used` を確認でき、finish summary では total locked zones を読める

## Acceptance Criteria

- `Zone Lock` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- zone rule は overlapping cell を共有し、1 zone だけを独立に埋めても solve にならない
- workspace 上で current round、locked zone count、resets used、time remaining が visible に更新される
- Result、profile、rankings では `clear time` と `resets used` が保存される

## Edge Cases

- idle state の preview puzzle は hydration drift を起こさない
- idle 中または timeout 後の cell tap は state を変えない
- empty board のまま `Reset board` を押しても reset count は増えない

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を zone card と board cell に付け、zone target count、current count、locked state、cell active state、round completion を読めるようにする
- narrow viewport でも zone card と board cell が readable で touch-safe である

## Distinction

- `Sudoku` の row/column/grid completeness ではなく、overlapping local zone constraints の干渉が主題
- `Stack Sort` の stepwise rearrangement ではなく、single tap で複数 rule が動く count interference が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
