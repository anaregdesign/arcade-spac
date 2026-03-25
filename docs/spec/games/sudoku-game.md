# Sudoku Game

## Summary

`Arcade` の phase 1 lineup として `Sudoku` を提供する。9x9 puzzle を解き切るまでの solve time を競い、support metric として `Hints used` を持つ logic game とする。

## User Problem

- keypad と keyboard shortcut の両方で board を進めたい
- 入力中でも selected cell を見失わずに current target を把握したい
- mobile では keypad の連打だけでなく、touch gesture でも digit を素早く入れたい
- solve time だけでなく、hint の使用量を result と profile で確認したい

## Users and Scenarios

- ユーザは home から `Sudoku` を選び、difficulty に応じた puzzle をすぐ始めたい
- ユーザは cell を選択し、keypad または keyboard で digit を埋めたい
- ユーザは必要なときだけ hint を使い、quality を落としすぎずに clear を狙いたい
- ユーザは puzzle を solve した結果だけでなく、途中終了した not-cleared result も確認したい

## Scope

- `Sudoku` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `Hints used` とする
- keypad、keyboard shortcut、clear cell、hint の board controls を同一 workspace で提供する
- selected cell を board 上で見失いにくい visual emphasis を提供する
- narrow かつ touch-first な viewport では selected editable cell から flick して digit を選べる input path を提供する
- live puzzle 中の `Finish run` は not-cleared result を保存し、履歴には残すが rankings 対象外とする

## Non-Goals

- candidate pencil mark の高度な編集 UI
- puzzle import、shareable seed、daily challenge
- separate tutorial route や onboarding overlay

## User-Visible Behavior

- home で `Sudoku` card が他ゲームと同じ pattern で表示される
- game screen では `difficulty` を選んで `Start run` すると新しい puzzle が始まる
- ユーザは editable cell を選択し、keypad または keyboard の `1` から `9` で digit を入力できる
- selected cell は row、column、box の context から視認できる強調状態を保つ
- coarse pointer の touch device では selected editable cell を touch して flick すると、digit chooser から `1` から `9` を選んで入力できる
- `Clear cell`、`Delete`、`Backspace` で選択中 cell を空にでき、`Use hint` または `H` で次の correct digit を補助できる
- puzzle を正しく埋め切ると result screen へ自動遷移し、`clear time` と `Hints used` を確認できる
- live puzzle 中に `Finish run` を押すと not-cleared result を開き、その run は history only として扱われる

## Acceptance Criteria

- ユーザは home から `Sudoku` を起動できる
- touch と keyboard のどちらでも puzzle を進められる
- selected cell が keypad 入力後も board 上で識別できる
- coarse pointer の touch device では tap だけで selection を変え、flick gesture で digit を入れられる
- clear run は `clear time`、`Hints used`、mistake 情報を保存できる
- result screen では support metric として `Hints used` を表示する
- `Finish run` で終了した未完了 run は result screen を開くが、rankings と total points の対象外になる

## Edge Cases

- run 開始前の入力は score を保存しない
- touch で cell を tap しただけでは digit を入力せず、selection だけを変える
- route を離れても進行中 puzzle を自動で clear や fail として保存しない
- save failure 時は current metrics を pending-save recovery に保持する
- narrow viewport でも board と keypad が同一 workspace で使える

## Constraints and Dependencies

- primary metric は duration formatter を使う
- support metric は `hintCount` を `Hints used` として表示する
- mistake count は quality と summary に反映してよいが、support metric の主表示は `Hints used` とする
- `Finish run` は failed result として保存し、`leaderboardEligible` を付けない

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Flow: [../screen-flow.md](../screen-flow.md)
