# UI Specs

## Result Screen Score Focus

## Summary

`Result` 画面は、今回の記録を最初の視線で理解できる score-first レイアウトを採用する。

## User Problem

- 結果画面で説明文や補助情報が強すぎると、今回の記録が埋もれやすい
- Run 直後に知りたい情報へ辿り着くまでの読み込みコストが高い
- 次の action より前に長い説明を読む必要があると、再挑戦の勢いが落ちる
- Result 下部の長い detail block が次の行動に直結しないと、視線が散って離脱しやすい

## Users and Scenarios

- プレイヤーは run 完了直後に、今回の記録を一目で把握したい
- プレイヤーは自己ベスト差分や順位影響を短く確認したい
- プレイヤーは説明文を読む前に replay と share を選びたい
- プレイヤーは result の直後に、recommendation に基づく次のゲーム候補をすぐ選びたい

## Scope

- `Result` 画面の visual hierarchy を score-first に整える
- 初期表示の説明量を減らし、補助情報を secondary area へ寄せる
- desktop と mobile の両方で、score と次の action が同じ画面で見えるようにする
- Result 下部を recommendation ベースの次ゲーム導線へ置き換える

## Non-Goals

- Result data model の変更
- Ranking や share 文面の再定義
- Game ごとの metric 定義変更

## User-Visible Behavior

- 最も大きく見える要素は今回の primary metric になる
- 自己ベスト差分、順位やポイントへの影響は短い KPI として整理される
- Replay と Share の主要 action は近接配置される
- Result 下部には、次に遊ぶ候補として recommendation ベースの 3 ゲームが表示される
- `pending save` や `failed` のような例外状態でも、score-first の hierarchy は崩れない
- Home search 下の summary badge には `VISIBLE UNPLAYED` と `VISIBLE RANKED` を表示しない

## Acceptance Criteria

- 初期表示で今回の記録が最優先で視認できる
- 初期表示の本文量が減り、次の action を迷わず選べる
- Desktop と mobile の両方で、score、status、次の action が 1 画面目で把握できる
- Result 下部の recommendation area から 3 件の次ゲーム候補を確認できる
- Home の search summary row に `VISIBLE UNPLAYED` と `VISIBLE RANKED` badge が残らない

## Edge Cases

- 長い game 名や status badge があっても、score の視認性を損なわない
- Teams share が使えない状態でも、action の並びが崩れない
- recommendation 学習が浅い場合でも、安定した fallback 順で 3 件を表示できる

## Result Next-Game Recommendations

### Summary

Result 画面の下部は run detail の常設表示ではなく、recommendation に基づく次ゲーム 3 件の導線に置き換える。

### User Problem

- Result 下部に run detail が長く残ると、次に何を遊ぶかの判断に直接つながりにくい
- Replay 以外の次の一手が弱いと、結果確認後の回遊が途切れやすい

### Users and Scenarios

- プレイヤーは結果を見た直後に、次に遊ぶ候補を 3 件程度に絞って提示してほしい
- 継続利用者は recommendation に沿った候補から、そのまま次のゲームへ進みたい

### Scope

- Result 下部の run detail 常設ブロックを外す
- recommendation に基づく次ゲーム候補を 3 件表示する
- 各候補から対象ゲームへ直接進めるようにする

### Non-Goals

- Result KPI の定義変更
- Home の recommendation ranking アルゴリズム自体の再設計
- 4 件以上の recommendation grid への拡張

### User-Visible Behavior

- Result 下部には run detail の長文ブロックではなく、次に遊ぶ 3 件の recommendation が表示される
- recommendation は今回の結果と既存の recommendation 方針に沿って選ばれる
- 各 recommendation card から、そのゲームへ直接遷移できる

### Acceptance Criteria

- Result 下部に run detail 常設ブロックが表示されない
- recommendation area には常に 3 件の次ゲーム候補が表示される
- recommendation 学習が浅い場合でも、fallback 順で 3 件を欠けなく表示できる

### Edge Cases

- 現在のゲーム自身を recommendation に含めるか除外するかは、重複が多すぎない方を優先して一貫させる
- 候補ゲーム数が十分多い前提でも、一時的な data 欠損で 3 件に満たない場合は fallback で補完する

## Result Screen Share Action Labels

### Summary

`Result` 画面の share action は `Share` に統一し、共有内容を確認して copy できる popup を開く。

### User Problem

- `Share to Teams` のように共有先が固定された表記だと、実際に何が共有されるか分かりにくい
- Result action に Home や Rankings の補助導線が並ぶと、score-first な画面で主 action が散る
- 共有前に内容を確認できず、クリップボードへ何が入るか分からないと安心して使いにくい

### Users and Scenarios

- プレイヤーは Result 画面の action を同じ文脈で読みたい
- プレイヤーは `Share` を押したときに、コピーされるゲーム URL、タイトル、短い説明を先に確認したい
- プレイヤーは popup 内の copy button から、その内容をクリップボードへ確実に入れたい

### Scope

- Result の共有 action label を `Share` に統一する
- Result の Home / Rankings 補助 action を常設しない
- Share action で popup を開き、対象ゲーム URL、ゲームタイトル、短い説明文を確認できるようにする
- popup 内に clipboard copy button を置く

### Non-Goals

- Result 以外の share UX の全面見直し
- Result 以外の action label の全面見直し

### User-Visible Behavior

- Result 画面の共有 action は `Share` と表示される
- Replay の横に Home / Rankings の result-local action は表示されない
- `Share` を押すと popup が開き、対象ゲームの URL、ゲームタイトル、短い説明文を確認できる
- popup には clipboard copy button があり、表示中の共有文面をそのままコピーできる
- Replay のような主要 action は必要なテキストを維持する
- 共有できない状態でも、理由が短く分かる

### Acceptance Criteria

- Result 画面の共有 action は `Share` に統一され、`Share to Teams` 表記が残らない
- Replay の横に Home / Rankings の result-local action が表示されない
- `Share` popup でゲーム URL、ゲームタイトル、短い説明文を確認できる
- popup の copy button から共有文面をクリップボードへコピーできる
- Narrow screen でも Replay と Share が過密にならない

### Edge Cases

- 共有文面の説明が長すぎる場合でも、popup 内で内容全体を確認しやすい
- copy 成功後も popup の内容が失われず、再コピーしやすい
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

## Favorite Toggle Across Home, Game, and Result

### Summary

Home、Game、Result から、現在見ているゲームのお気に入り状態を直接 toggle できるようにする。

### User Problem

- `NEW` や `NO RECORD` の bubble が常に見えると、thumbnail より補助ラベルが目に入りやすい
- よく遊ぶゲームを後で探したくても、Home 一覧から好みを明示的に残せない
- Game や Result で「このゲームを残したい」と思っても、Home へ戻らないとお気に入り操作ができないと流れが切れる
- お気に入りを付けても、Home の探索導線から favorites-only に絞れないと再発見コストが高い

### Users and Scenarios

- プレイヤーは Home を眺めながら、後で遊びたいゲームをその場でお気に入り登録したい
- プレイヤーは session をまたいでも、お気に入りにしたゲームを同じ状態で見つけたい
- プレイヤーはプレイ中や Result 確認中にも、そのゲームをお気に入りへ追加したい
- プレイヤーは Home で favorites-only filter を使い、登録済みゲームだけをすぐ見つけたい

### Scope

- Home card から `NEW` と `NO RECORD` bubble を外す
- Home card、Game 画面、Result 画面にお気に入り toggle を配置する
- Home の検索・絞り込み領域に favorites-only filter を追加する
- toggle 状態が各画面の主目的を邪魔しない visual priority に整える

### Non-Goals

- Home の検索、並び替え、追加読込ロジックの変更
- Rankings 画面へのお気に入り操作追加

### User-Visible Behavior

- Home card の上部または補助 action 領域に、お気に入り状態を切り替える control がある
- Home の filter から、お気に入り登録済みゲームだけを一覧表示できる
- Game 画面の共通 controls 付近に、現在のゲームのお気に入り状態を切り替える control がある
- Result 画面の action 群または補助 action 領域に、対象ゲームのお気に入り状態を切り替える control がある
- `NEW` と `NO RECORD` bubble がなくても、thumbnail とゲーム名を主な手掛かりに一覧比較できる
- お気に入りにしたゲームは、再読み込みや再 sign-in 後も同じ状態で表示される

### Acceptance Criteria

- Home card 一覧で `NEW` と `NO RECORD` bubble が表示されない
- sign-in 済み利用者は Home、Game、Result の各画面から 1 操作でお気に入り状態を切り替えられる
- sign-in 済み利用者は Home で favorites-only filter を使い、お気に入り登録済みゲームだけへ絞り込める
- お気に入り状態は利用者単位で保持され、別 session でも復元される

### Edge Cases

- 初回利用で record がなくても、お気に入り toggle は通常どおり表示される
- 多数のゲームが並ぶ状態でも、お気に入り control が card title や thumbnail を圧迫しない
- Game や Result で toggle を追加しても、Restart、Replay、Share、How to play など既存の主要 action を押しにくくしない
- お気に入りが 0 件の状態で favorites-only filter を有効にしても、空状態が分かりやすく、通常一覧へ戻しやすい

## In-Game Restart Control

### Summary

プレイ中の Game 画面には、現在の run を最初からやり直す `Restart` control を常設する。

### User Problem

- 途中で操作を誤ったり方針を変えたくなったとき、結果画面まで進まずに run をやり直せないとテンポが落ちる
- 各ゲームごとに restart 方法が違う、または存在しないと、共通の操作期待が崩れる

### Users and Scenarios

- プレイヤーはゲーム中に失敗を察知した時点で、すぐ新しい run に入り直したい
- プレイヤーは難易度を選び直さず、現在の game context のまま最初からやり直したい

### Scope

- 共通の Game 画面 controls に `Restart` 相当の action を追加する
- action 実行時に current run の board、timer、score、round progress などを初期化する
- 選択中 difficulty や現在の game route は維持したまま fresh run を開始する

### Non-Goals

- Result 画面の replay action の置き換え
- Home へ戻る導線の変更
- game ごとの固有 rule や scoring 定義変更

### User-Visible Behavior

- プレイヤーは Game 画面の controls から 1 操作で `Restart` を実行できる
- `Restart` 実行後は、進行中 run の状態が破棄され、その game の開始状態から直ちに再開する
- 選択中 difficulty や共通 controls の配置は維持され、How to play 導線と競合しない

### Acceptance Criteria

- すべての実ゲーム画面で、プレイ中に `Restart` action が見つけられる
- `Restart` 後は incomplete run の状態を引き継がず、timer や board state が初期化される
- `Restart` は current game と selected difficulty を維持したまま fresh run を始める

### Edge Cases

- 開始直後に `Restart` しても、二重初期化や broken state にならない
- touch device でも、既存の主要操作や `How to play` を押しにくくしない
