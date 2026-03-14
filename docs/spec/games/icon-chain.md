# Icon Chain

## Summary

`Arcade` に `Icon Chain` を追加する。brief reveal で見た icon order を partial clue board から復元し、first-to-last の sequence を再構築する memory-inference puzzle とする。

## User Problem

- catalog には memory game があるが、pure recall や pair matching が中心で、clue inference を使う memory puzzle が不足している
- memory と logic をまたぐ game family を増やしたい

## Users and Scenarios

- 利用者は Home から `Icon Chain` を開き、brief reveal で icon order を覚えた後、partial clue から sequence を再構築したい
- 利用者は workspace で current position、revealed clue、wrong picks を見ながら chain を伸ばしたい
- 利用者は Result、profile、rankings で `longest chain` と `wrong picks` を確認したい

## Scope

- `Icon Chain` を home、workspace、result、rankings、profile に統合する
- primary metric は `longest chain`、support metric は `wrong picks` とする
- workspace では clue board、selection progress、current chain length、wrong pick count を visible にする

## Non-Goals

- pair matching board
- full note-taking editor
- endless memory marathon

## User-Visible Behavior

- idle overlay から run を開始すると、icon sequence が短時間だけ reveal され、その後 clue board に切り替わる
- clue board には first icon、last icon、adjacent pair、color family、position relation など partial clue が残る
- 利用者は icon candidates を first-to-last の順で選び、正しい選択で chain が伸びる
- wrong pick は `wrong picks` を増やし、current chain を止めるか quality を大きく下げる
- round が進むほど icon count と clue ambiguity が上がる
- target chain length に達すると clear となり Result に遷移する

## Acceptance Criteria

- `Icon Chain` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または fail が確定する
- reveal phase と clue reconstruction phase が明確に分かれている
- pure pair matching ではなく、order recall と clue inference の両方が必要になる
- Result、profile、rankings では `longest chain` と `wrong picks` が保存される

## Edge Cases

- reveal 中の candidate tap は state を変えない
- already confirmed icon を再選択して duplicate progress が起きない
- clue set は deterministic verification が可能な bounded pattern である
- narrow viewport でも clue card と icon candidate grid が同時に readable である

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を reveal state、clue type、candidate icon、selection index に付ける
- clue wordingは短く、touch path を妨げない

## Distinction

- `Pair Flip` の pair memory ではなく、order reconstruction と clue inference が主題
- `Sequence Point` の direct replay ではなく、partial information から sequence を再構成する logic-memory hybrid

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
