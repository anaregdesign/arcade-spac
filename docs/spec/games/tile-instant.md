# Tile Instant

## Summary

`Arcade` に `Tile Instant` を追加する。短時間だけ visible な target tile arrangement を記憶し、watch phase 後に shuffled board を swap して即座に再構築する flash reconstruction game とする。

## User Problem

- `Tile Shift` や `Swap Solve` は live target を見ながら解く logic puzzle で、flash memory reconstruction の緊張感がない
- memory phase と board solve phase を短く往復する compact puzzle が不足している

## Users and Scenarios

- 利用者は Home から `Tile Instant` を開き、watch phase の target board を素早く覚えたい
- 利用者は input phase で hidden target を思い出しながら live board を swap して再現したい
- 利用者は Result、profile、rankings で `clear time` と `moves` を確認したい

## Scope

- `Tile Instant` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `moves` とする
- round progress と current phase は workspace と finish copy に見せ、shared result contract には `clear time` と `moves` を載せる

## Non-Goals

- drag-and-drop tile motion
- unlimited target reference board
- long-form spatial planning puzzle

## User-Visible Behavior

- run を開始すると current round の target board が短時間だけ full visibility で表示される
- watch phase が終わると target board は hidden state に切り替わり、shuffled live board だけが操作可能になる
- 利用者は live board の tile を 2 枚ずつ選んで swap し、記憶した target arrangement を再構築する
- round が solve されると次 round の watch phase が即座に始まり、規定 round を完了すると Result へ遷移する
- Result、profile、rankings では `clear time` と `moves` を確認できる

## Acceptance Criteria

- `Tile Instant` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- watch phase と input phase が明確に切り替わる
- workspace 上で current round、phase、moves、watch target hidden state が visible に更新される
- Result、profile、rankings では `clear time` と `moves` が保存される

## Edge Cases

- watch phase 中の tile tap は state を変えない
- selected tile を再タップすると selection が解除される

## Constraints and Dependencies

- narrow viewport でも hidden target panel と live board の両方が readable で touch-safe である

## Distinction

- `Tile Shift` の live target alignment ではなく、watch-first reconstruction が主題
- `Swap Solve` の persistent target reference ではなく、flash memory で target を保持する点が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
