# UI Specs

## Result Screen Score Focus

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

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Flow: [screen-flow.md](./screen-flow.md)

## Result Screen Share Action Labels

### Summary

`Result` 画面の共有アクション表記を英語に統一し、意味が十分固定されている補助アクションはアイコンだけで表現する。

### User Problem

- `Result` 画面の主要導線は英語中心だが、共有アクションだけ日本語が残っていて表記が揃っていない
- 補助アクションまで文字量が多く、score-first な画面で視線が散りやすい

### Users and Scenarios

- ユーザは run 完了後に、結果確認の流れを言語の切り替わりなくたどりたい
- ユーザはランキング確認やホーム復帰のような定番導線を、長い文言を読まずに押したい
- ユーザは Teams 共有先を誤解せずに共有を実行したい

### Scope

- `Result` 画面の共有アクション表記を英語に統一する
- 意味が十分固定された補助アクションをアイコンボタンへ置き換える
- アイコンボタンでもアクセシビリティ上の名称は維持する

### Non-Goals

- 共有先の追加や share URL の変更
- `Result` 画面以外の action label の一括見直し
- rankings や home の遷移仕様変更

### User-Visible Behavior

- owner 表示時の Teams 共有アクションは英語ラベルで表示される
- rankings と home の補助アクションは、視覚上はアイコンだけで判別できる
- replay のように文脈依存で意味を補った方がよい主要アクションはテキストを維持する
- lock 状態の Teams 共有でも、英語ラベルのまま利用不可と分かる

### Acceptance Criteria

- `Result` 画面に日本語の共有ボタン文言が残らない
- `Result` 画面の rankings 導線がアイコンのみで表示される
- `Result` 画面の home 導線がアイコンのみで表示される
- アイコンのみの導線でも、支援技術向けの名称が失われない

### Edge Cases

- Teams 共有が lock 状態でも action strip の並びが崩れない
- narrow screen でも icon-only action が過密にならず押せる

### Constraints and Dependencies

- 既存の action-link スタイルを大きく崩さず、結果画面の score-first hierarchy を維持する
- 共有先が Teams であることは視覚的または accessible name で判別できるようにする

### Links

- Related: [#result-screen-score-focus](#result-screen-score-focus)

## Game Panel Preview Simplification

### Summary

Home の各ゲームパネルに表示する preview image で、盤面を囲う内側フレームのサイズと余白を整えて、内容に対して自然な見え方にする。

### User Problem

- 一部のゲーム preview は内側フレームのサイズが内容に対して不自然で、盤面が枠からはみ出して見える
- game panel の一覧で複数カードを並べたとき、フレームの余白バランスが崩れて見える

### Users and Scenarios

- ユーザは Home のゲーム一覧を流し見しながら、各ゲームの雰囲気をすばやく見分けたい
- ユーザは preview 内の盤面や色、数字、カード配置を主情報として見たい

### Scope

- Home の game preview 画像で、内側フレームのサイズと余白を中身に合わせて調整する
- ラベル文字や盤面の可読性は維持する

### Non-Goals

- Home カード全体のレイアウト変更
- preview 画像の全面的な描き直し
- 実ゲーム画面のUI変更

### User-Visible Behavior

- Color Sweep、Number Chain、Pair Flip の preview では、内側フレームが盤面を自然に囲むサイズになる
- 盤面や記号が枠からはみ出して見えず、ゲームごとの見分けやすさは維持される

### Acceptance Criteria

- 対象 preview 画像で、内側フレームが主要要素を不自然に切らない
- フレームの上下左右の余白が視覚的に安定する
- カード一覧で preview の違和感が減る

### Edge Cases

- フレームを調整してもラベル文字や主要要素が窮屈にならない
- 盤面がフレームの外へはみ出して見えない

### Constraints and Dependencies

- 既存の画像アセット差し替えで完結させ、Home カードの実装コードは変えない

### Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)

## Game Workspace Shared Components

### Summary

複数 game の workspace で共通になっている controls card、board 上の start overlay、finish card を shared React Component に集約し、見た目と操作を揃えたまま保守しやすくする。

### User Problem

- game ごとの workspace で同じ UI 構造を個別実装すると、label、spacing、disabled 表現がずれやすい
- 一部の game だけ修正されて他が古いまま残ると、ゲーム横断 UI の一貫性が崩れる
- 同じ変更を複数 file に反映する必要があり、small UI change でも regress の確率が上がる

### Users and Scenarios

- ユーザはどの game を開いても、difficulty、run status、primary actions、finish summary が同じ UI pattern で並んでいると理解しやすい
- 開発者は共通 UI を 1 か所直すだけで複数 game へ一貫して反映したい

### Scope

- game workspace の共通 controls card を shared React Component に切り出す
- game workspace の共通 board start overlay を shared React Component に切り出す
- game workspace の共通 finish card を shared React Component に切り出す
- 各 game workspace は board 固有 UI と game-specific action だけを持つ構成へ整理する

### Non-Goals

- 各 game の play rule や scoring の変更
- result、rankings、profile の layout 変更
- game-specific board UI の共通化

### User-Visible Behavior

- マインスイーパ、数独、Drop Line の game screen で、上部 controls card と下部 finish card の構造と spacing は今まで通り維持される
- 未開始 state では board 上に `Start run` overlay が表示され、最初の action を board の近くで始められる
- difficulty selector、run status chips、primary actions、board overlay、finish summary の配置順は全 game で共通 pattern を保つ
- game 固有の action は従来どおり残し、共通 card の中で同じ操作感で表示される
- 共通 card の修正が必要になった場合も、全 game で同時に揃った見た目を維持できる

### Acceptance Criteria

- game workspace 3 画面の controls card が shared React Component 経由で描画される
- game workspace 3 画面の idle board overlay が shared React Component 経由で描画される
- game workspace 3 画面の finish card が shared React Component 経由で描画される
- 各 game workspace は board 固有部分と game 固有 action / status 内容だけを持つ
- 既存の操作導線、disabled 条件、result 遷移タイミングは変わらない
- desktop と mobile の両方で controls card と finish card の表示崩れが起きない

### Edge Cases

- game ごとに primary actions の数が異なっても共通 controls card で表示できる
- board start overlay の文言は game ごとに変えても、layout と button affordance は共通に保てる
- finish card に secondary action がある game とない game の両方を扱える
- board 幅が game ごとに異なっても、共通 card の幅や spacing が破綻しない

### Constraints and Dependencies

- shared UI は `app/components/games/shared/` 配下の React Component として配置する
- 各 game workspace の session Hook や submit logic は維持し、presentational な共通化に留める

### Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [screen-flow.md](./screen-flow.md)

## Component View-Only Boundaries

### Summary

主要 screen と game workspace の UI は、見え方と操作結果を変えずに `components` を View-only として保ち、non-trivial client logic は `app/lib/client/usecase` 側で ownership を持つ。

### User Problem

- screen ごとの state、event handler、result submit、sound trigger、browser side effect が View と同じ file に混ざると、UI 変更時の影響範囲が読みづらい
- 同じ UI を保った internal refactor でも、logic の置き場が揃っていないと regression の原因を追いにくい
- shared shell や game workspace の振る舞いが component ごとに散ると、見た目を維持した refactor を継続しづらい

### Users and Scenarios

- プレイヤーは Home、Profile、Rankings、Result、Login、各 game workspace を従来どおり同じ見え方と操作感で使いたい
- プレイヤーは game run 完了時に、clear / fail の結果に応じて従来どおり Result へ遷移したい
- 開発者は UI を直すとき、presentational な `components` と interaction logic を別々に追える状態を保ちたい

### Scope

- `components` は render、accessibility wiring、visual branching に集中する
- screen-level の derived view model、browser side effect、dialog / shell state、workspace submit orchestration は `app/lib/client/usecase` へ寄せる
- game workspace は board 固有の rendering を `components` に残しつつ、run status・sound feedback・result submit は usecase 側で管理する
- browser environment から取得する state、DOM update、browser event subscription、browser scheduler、browser-native payload 生成は `app/lib/client/infrastructure/browser/` の adapter へ集約する

### Non-Goals

- Home、Profile、Rankings、Result、Login、game workspace の visual redesign
- route、loader、action、domain rule、score formula の変更
- user-facing copy や navigation path の変更

### User-Visible Behavior

- Home の search、filter、sort、show more、preview、play 導線は従来どおり動作する
- App shell の menu、help dialog、sound mute、navigation は従来どおり使える
- Profile の theme preview、profile edit form、trend 表示、game 別 performance 表示は従来どおり維持される
- Rankings、Result、Login の copy、action、status 表示は従来どおり維持される
- 各 game workspace では start overlay、difficulty 切り替え、play 中 status、sound feedback、clear / fail 後の自動 Result 遷移が従来どおり動作する
- Home の scroll restore、Profile の theme preview、Sudoku の keyboard input、各 game の timer / animation loop、sound playback は browser adapter 経由でも同じ体感を維持する

### Acceptance Criteria

- non-trivial state transition、derived view-model helper、browser side effect、result submit orchestration は `app/components/` 直下に残さない
- `app/lib/client/usecase/` に screen / workspace ごとの public entry があり、component は View rendering を主責務にする
- `app/lib/client/usecase/` と `app/lib/client/` 配下に direct な `window` / `document` / `AudioContext` / `FormData` access を残さず、browser-specific integration は `app/lib/client/infrastructure/browser/` から呼ばれる
- Home、Profile、Rankings、Result、Login、App shell、game instructions dialog の表示・操作結果に regression がない
- 7 game workspace の run 開始、play 中、clear / fail、Result 遷移の挙動が変わらない

### Edge Cases

- Home の URL query / local storage restore / scroll restore は refactor 後も壊れない
- Profile の theme preview は form 保存前でも即時反映される
- shared result / pending result / direct game route から開いた screen でも app shell と Result の導線が崩れない
- touch 前提の game でも Flag mode や tap feedback が従来どおり機能する

### Constraints and Dependencies

- canonical layout は `app/lib/client/usecase/<feature>/` を基準にする
- `components` には tiny な View-only interaction を除く logic を持ち込まない
- browser-specific code は `app/lib/client/infrastructure/browser/` を leaf owner とし、usecase 側では adapter 経由で使う
- internal refactor であっても、user-visible behavior は変えずに維持する

### Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [screen-flow.md](./screen-flow.md)

## CSS Module Adoption

### Summary

各 UI component の見た目をその component の近くへ閉じ込め、`app/app.css` には theme、reset、page shell、共通 utility などの global CSS だけを残す。

### User Problem

- 1 つの global stylesheet に component 固有の style が集まっているため、ある画面の見た目を直すだけでも他画面へ波及する不安がある
- component と style の距離が遠く、修正時にどの selector がどの画面に効いているのか追いにくい
- UI を追加・変更するたびに global CSS が肥大化し、保守コストが上がる

### Users and Scenarios

- 開発者は component を開いたとき、その component 専用の CSS をすぐ近くで確認・修正したい
- 開発者は screen や game workspace の style を変更しても、関係ない画面の style を意図せず壊したくない
- ユーザは CSS の配置変更後も、既存の画面表示と操作感が変わらず維持されることを期待する

### Scope

- component 固有の selector を CSS Modules へ移し、component と同じディレクトリまたは近い shared component ディレクトリに配置する
- component 側の `className` を CSS Module の参照に置き換える
- `app/app.css` から component ローカル CSS を削除し、global CSS のみを残す

### Non-Goals

- 画面レイアウトや copy の redesign
- 新しい UI component library の導入
- route、loader、action、domain logic の変更

### User-Visible Behavior

- Home、Rankings、Profile、Login、Result、各 game workspace の見た目は従来どおり維持される
- global theme、reset、page shell、shared action/button/input pattern はこれまでどおり全体に適用される
- component ごとの style 変更は、その component に閉じた CSS Module で管理できる

### Acceptance Criteria

- component 専用の style は CSS Module file として component の近くに存在する
- `app/app.css` には theme variable、reset、global layout、shared utility pattern だけが残る
- 対象 component は CSS Module import を使って表示崩れなく描画される
- 既存の build と typecheck が通る

### Edge Cases

- state に応じて class を切り替える game workspace の button、tile、cell でも CSS Module 参照で同じ見た目を維持できる
- responsive breakpoint と dark theme は global CSS と local CSS をまたいでも表示崩れを起こさない
- shared game workspace component は複数 game から使われても、必要な style を共通 CSS Module で再利用できる

### Constraints and Dependencies

- `app/root.tsx` の global stylesheet import は維持し、global CSS の entry point は変えない
- 既存の build / typecheck command を使って検証する

### Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [screen-flow.md](./screen-flow.md)
