# Result Screen Score Focus

## Summary

`Result` 画面の情報密度を下げ、今回の記録を最初の視線で理解できる `score-first` レイアウトへ更新する。説明文や補助情報は圧縮し、主役の score を大きく強く見せる。

## User Problem

- 現在の `Result` 画面は説明文と impact summary が強く、今回の score が第一印象で埋もれやすい
- run 直後にユーザが知りたい `良かったかどうか` の判断が、複数段落を読む前提になっている
- replay や他 game への移動より前に、画面の読み込みコストが高い

## Users and Scenarios

- ユーザは run 完了直後に、今回の記録を大きく見て結果の良し悪しを瞬時に把握したい
- ユーザは自己ベスト差や points 影響を確認したいが、初期表示では短く圧縮された情報で十分である
- ユーザは説明文を読む前に replay、rankings、share へ進みたい

## Scope

- `Result` 画面の visual hierarchy を score-first に作り直す
- 初期表示のテキスト量を減らし、補助説明を disclosure に移す
- `Desktop` と `mobile` の両方で hero score が主役になる responsive layout に整える

## Non-Goals

- result data model 自体の変更
- rankings 算出ロジックや share 文面の変更
- game ごとの metric 定義変更

## User-Visible Behavior

- 画面上部で、game 名、status、best badge よりも `今回の記録` が最も大きく表示される
- 初期表示では長い summary paragraph を並べず、score の補助情報は短い label と compact value に圧縮する
- `game rank`、`total points`、`overall rank` は一目で比較できる短い KPI 表示を維持するが、説明文は短く抑える
- 再挑戦、rankings、share、home への主要 action は score hero のすぐ下または近接位置で辿れる
- 詳細説明、share availability、state explanation などの補助情報は disclosure 内または secondary area で確認できる
- `pending save` や `failed` のような例外状態でも、score-first の hierarchy を崩さずに状態だけ短く補足する

## Acceptance Criteria

- `Result` 画面の初期表示で最も大きい文字要素が今回の primary metric になる
- 初期表示の本文 paragraph 数が現状より減る
- `Result` 画面の初期表示で replay action が明確に見える
- `Desktop` と `mobile` の両方で、score、status、次の action が 1 画面目で把握できる
- `pending save` と `failed` の状態でも、必要な補足は残しつつ score-first layout を維持する

## Edge Cases

- `Drop Line` のように `px` 表示の game でも hero score が崩れない
- `Microsoft Teams` share が lock 状態でも主要 action の並びが崩れない
- 長い game 名や status badge があっても hero score の視認性を損なわない

## Constraints and Dependencies

- 既存の result data を使い、必要な情報は削らずに初期表示から詳細表示へ整理し直す
- `Result` 画面の共通性は保ち、game ごとに別 layout へ分岐しない

## Links

- Related: [product-requirements.md](./product-requirements.md)
- Flow: [screen-flow.md](./screen-flow.md)
