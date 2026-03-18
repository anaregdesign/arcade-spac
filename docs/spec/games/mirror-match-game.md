# Mirror Match Game

## Summary

`Mirror Match` は左側の target pattern を見ながら、右側の editable grid を mirror counterpart に揃えるまでの `clear time` を競う spatial / memory game である。

## User Problem

- target を見て別 board を合わせる copied-pattern game が欲しい
- `Light Grid` より直接的で、短時間で繰り返しやすい spatial task が欲しい

## Users and Scenarios

- ユーザは target grid を見て editable grid を toggle する
- mirror relation を意識しながら短い run を replay したい

## Scope

- target grid と editable mirror grid
- primary metric は `clear time`
- support metric は `Moves`

## Non-Goals

- free-form drawing
- asymmetrical scoring bonus

## User-Visible Behavior

- left panel に target pattern、right panel に editable grid が表示される
- editable cell を tap すると on/off が切り替わる
- editable grid が target mirror と一致すると clear する

## Acceptance Criteria

- target と editable board が同時表示される
- move count が support metric として保存される
- 1 run は 2 分以内で完了する

## Edge Cases

- clear 後の追加 tap は無視される
- target board は live run 中に変化しない

## Links

- Related: [two-minute-expansion-wave.md](./two-minute-expansion-wave.md)
