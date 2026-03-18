# UI Specs

## Result Screen Score Focus

## Summary

`Result` 画面は、今回の記録を最初の視線で理解できる score-first レイアウトを採用する。

## User Problem

- 結果画面で説明文や補助情報が強すぎると、今回の記録が埋もれやすい
- Run 直後に知りたい情報へ辿り着くまでの読み込みコストが高い
- 次の action より前に長い説明を読む必要があると、再挑戦の勢いが落ちる

## Users and Scenarios

- プレイヤーは run 完了直後に、今回の記録を一目で把握したい
- プレイヤーは自己ベスト差分や順位影響を短く確認したい
- プレイヤーは説明文を読む前に replay、rankings、share、home へ進みたい

## Scope

- `Result` 画面の visual hierarchy を score-first に整える
- 初期表示の説明量を減らし、補助情報を secondary area へ寄せる
- desktop と mobile の両方で、score と次の action が同じ画面で見えるようにする

## Non-Goals

- Result data model の変更
- Ranking や share 文面の再定義
- Game ごとの metric 定義変更

## User-Visible Behavior

- 最も大きく見える要素は今回の primary metric になる
- 自己ベスト差分、順位やポイントへの影響は短い KPI として整理される
- Replay、Rankings、Share、Home への action は近接配置される
- `pending save` や `failed` のような例外状態でも、score-first の hierarchy は崩れない

## Acceptance Criteria

- 初期表示で今回の記録が最優先で視認できる
- 初期表示の本文量が減り、次の action を迷わず選べる
- Desktop と mobile の両方で、score、status、次の action が 1 画面目で把握できる

## Edge Cases

- 長い game 名や status badge があっても、score の視認性を損なわない
- Teams share が使えない状態でも、action の並びが崩れない

## Result Screen Share Action Labels

### Summary

`Result` 画面の share と補助 action は、言語と視認性が揃った表現にする。

### User Problem

- 共有 action だけ表記ルールが違うと、画面全体の読み心地が崩れる
- 補助 action まで文字量が多いと、score-first な画面で視線が散る

### Users and Scenarios

- プレイヤーは Result 画面の action を同じ文脈で読みたい
- プレイヤーは Home や Rankings への定番導線を、長いラベルを読まずに認識したい
- プレイヤーは Teams 共有先を誤解せずに操作したい

### Scope

- Teams 共有 action の表記を画面全体のルールに揃える
- 意味が固定された補助 action は icon 中心で分かるようにする
- 視覚表現が短くなっても、意味の判別は落とさない

### Non-Goals

- 共有先や share URL の変更
- Result 以外の action label の全面見直し

### User-Visible Behavior

- Teams 共有 action は画面全体と揃った表記で表示される
- Home と Rankings の補助導線は、短い icon 表現でも判別しやすい
- Replay のような主要 action は必要なテキストを維持する
- 共有できない状態でも、理由が短く分かる

### Acceptance Criteria

- Result 画面の share 周辺だけが別言語や別ルールに見えない
- Icon 中心の補助 action でも、押し間違えにくい
- Narrow screen でも action strip が過密にならない

### Edge Cases

- Teams share が lock 状態でも action の意味が分かる
- 主要 action と補助 action の優先度が逆転しない

## Game Panel Preview Simplification

### Summary

Home の game panel preview は、ゲーム内容をひと目で判断しやすい framing と情報量に揃える。

### User Problem

- Preview ごとに framing や余白の差が大きいと、一覧比較がしづらい
- 主役の board や icon が小さすぎると、何のゲームかを瞬時に判断しにくい

### Users and Scenarios

- プレイヤーは Home の一覧を流し見しながら、thumbnail を主な手掛かりに次のゲームを選びたい
- プレイヤーは preview を見ただけで、board、数字、色、カードなどの主題を把握したい

### Scope

- Preview の framing と余白を整える
- 主役の board や icon を見やすくする
- カード一覧での比較しやすさを揃える

### Non-Goals

- Home card 全体レイアウトの変更
- 実ゲーム画面の UI 変更

### User-Visible Behavior

- Preview 内の主役要素が小さすぎず、一覧で見分けやすい
- Frame や余白のばらつきが減り、カード一覧の見え方が揃う
- Preview が fallback 的な見え方ではなく、ゲーム内容を伝える画像として機能する

### Acceptance Criteria

- 対象 preview で主要要素が不自然に切れない
- 余白と framing のばらつきが減る
- カード一覧を流し見したときの違和感が減る

### Edge Cases

- Grid-heavy なゲームでも主要情報が潰れない
- Frame を詰めても、内容が窮屈に見えない
