# Product Specs

## Arcade App Requirements

## Summary

`Arcade` は、短時間で完結する browser game を 1 つの組織アカウントで横断して遊び、結果確認、再挑戦、ランキング比較、プロフィール確認まで迷わず進めるゲームポータルである。

## User Problem

- ゲームごとに入口や結果確認の導線が分かれると、継続利用しづらい
- 1 回ごとの結果だけでは、複数ゲームをまたいだ上達や現在地を把握しにくい
- ゲーム数が増えるほど、次に遊ぶ 1 本を素早く見つけられないと回遊が弱くなる

## Users and Scenarios

- プレイヤーはログイン後すぐに遊ぶゲームを選び、短い run を繰り返したい
- 競争志向のプレイヤーは、ゲーム別順位と総合順位の両方から次の改善対象を見つけたい
- 継続利用者は、プロフィールで自分の得意ゲーム、成長推移、公開状態を確認したい

## Scope

- 組織アカウントによる sign-in
- Home、Game、Result、Rankings、Profile、Help の主要導線
- ゲーム別ベスト、総合ポイント、期間別ランキング、共有導線
- 大量のゲームが並んでも探索しやすい catalog 体験

## Non-Goals

- リアルタイム対戦やチーム戦
- チャットやフレンド機能
- personal Microsoft account 向け認証
- 長時間 campaign や unlock tree

## User-Visible Behavior

- プレイヤーは組織アカウントで sign-in し、そのまま Home からゲームを選んで開始できる
- Home はゲーム選択ハブとして機能し、検索、絞り込み、並び替え、段階的な追加読込で大量のゲームを探せる
- 各ゲームカードは screenshot や thumbnail を主役にし、本文を読まなくてもゲーム内容を見分けやすい
- Game 画面は board と主要操作を優先し、How to play は必要なときだけ開ける
- Run が終わると追加の保存確認を挟まず Result へ進み、今回の記録、差分、次の行動がすぐ分かる
- Rankings では総合とゲーム別、シーズンと累計を切り替えても自分の位置を見失わない
- Profile ではゲーム別ベスト、総合ポイントの内訳、成長推移、表示名、公開範囲、表示テーマを確認または変更できる
- 保存失敗、未認証での共有リンク閲覧、プレイ途中離脱のような例外時でも、画面上で次の行動が分かる

## Acceptance Criteria

- Sign-in 後の最初の画面は Home であり、追加の onboarding を読まなくても最初のゲームを始められる
- Home は 100 個から 200 個規模の catalog を前提に、2 から 3 操作程度で目的のゲームへ辿り着ける
- 主要な画面では、初期表示の範囲で次の操作と現在の状態を判断できる
- どのゲームでも、run 完了後は Result に進み、再挑戦、ランキング確認、共有、Home 復帰へ迷わず進める
- Rankings では総合とゲーム別の両方を比較でき、Profile では継続的な上達を確認できる
- 例外状態でも silent failure にならず、再試行や復帰手段が画面に示される

## Edge Cases

- セッションが残っている場合は、不要な再 sign-in を求めずに自然復帰できる
- まだプレイ履歴が少ない利用者でも、Home で十分なゲーム候補を見つけられる
- 未認証で共有結果を開いた場合は、sign-in 後に対象結果へ戻れる

## Screen Expectations

### Login

- アプリ名、短い説明、sign-in CTA、利用規約とプライバシーへの導線がある
- Sign-in に失敗した場合は、再試行の判断ができる短い説明を表示する
- 既存セッションが有効なら Home へ自然に戻れる

### Home

- Home はゲーム探索と起動に集中した画面とする
- ゲームカードは screenshot または thumbnail を主役にし、ゲーム名とお気に入り操作のような最小限の要素だけで比較できる
- 検索、カテゴリまたはタグ、お気に入り状態、並び替え、追加読込を組み合わせて大量のゲームを探索できる
- ダッシュボード的な補助情報は主役にせず、ゲーム一覧を最初の視野で見せる
- `NEW` や `NO RECORD` のような汎用 status bubble は Home card に常設しない
- Home search 下の summary badge から `VISIBLE UNPLAYED` と `VISIBLE RANKED` は外す
- sign-in 済み利用者は各ゲームカードからお気に入り状態を直接 toggle できる
- sign-in 済み利用者は Home の filter から、お気に入り登録したゲームだけに一覧を絞り込める

### Game

- Board、現在の状態、主要操作が最優先で見える
- How to play は常設本文ではなく、必要時に開く補助導線として提供する
- プレイヤーは Game 画面から現在の game と difficulty を保ったまま、新しい run を即座に開始できる
- sign-in 済み利用者は Game 画面からも現在のゲームをお気に入りへ追加または解除できる
- Touch device でも desktop と同じ完了条件まで到達できる
- プレイ終了時は、そのまま Result へ遷移する

### Result

- 今回の記録が最初の視線で分かる score-first レイアウトを使う
- 自己ベスト差分、順位やポイントへの影響、共有可否、保存状態を短く整理して見せる
- Replay と Share を主要 action として近接配置し、Home と Rankings への result-local action は常設しない
- sign-in 済み利用者は Result 画面からも対象ゲームをお気に入りへ追加または解除できる
- Result 下部には冗長な detail block を常設せず、次に遊ぶ候補として recommendation ベースの 3 ゲームを表示する

### Rankings

- 総合とゲーム別を切り替えられる
- シーズンと累計を切り替えても文脈を見失わない
- 自分の順位、上位との差分、対象ゲームへの再挑戦導線を確認できる

### Profile

- ゲーム別ベスト、総合ポイントの内訳、成長推移を確認できる
- 表示名、公開範囲、表示テーマを調整できる
- お気に入りや得意分野を把握しやすい構成にする
- お気に入りゲームは利用者ごとに保持され、再訪時も同じ状態で確認できる

### Help And Recovery

- 各画面から一貫した方法で Help を開ける
- 保存保留、共有制限、未認証状態などの例外時は復帰手段を明示する
- ルール説明は必要時だけ開き、通常のプレイ画面を圧迫しない

## Competition And Progress

- 各ゲームは primary metric と support metric を持ち、Result、Rankings、Profile で一貫して扱う
- 総合ポイントは複数ゲームの継続利用と上達を比較しやすい形で表示する
- プレイヤーは単一ゲームの改善と総合力の改善を行き来できる

## Authentication And Access

- 認証対象は組織アカウントに限定する
- Sign-in 後の主要導線は Home を起点に統一する
- ランキング詳細、共有結果、プロフィール閲覧は認証済み利用者の体験として扱う

## MVP Scope

- Home、Game、Result、Rankings、Profile、Help の一貫した導線
- シーズンと累計のランキング比較
- 組織アカウント sign-in、共有導線、テーマ設定
- 短時間 run を前提にした catalog 体験

## Game Catalog Expansion

### Summary

`Arcade` は少数の初期 lineup に留まらず、短時間で切り替えて遊べる catalog を継続的に拡張する。新しいゲームが増えても、既存の Home、Result、Rankings、Profile の体験で同じように扱えることを前提とする。

### User Problem

- 本数が少ないと、毎回同じ数本に偏りやすく、継続利用の回遊性が弱くなる
- 追加ゲームが既存導線に乗らないと、catalog が増えるほど使いにくくなる
- 似たゲームばかり増えると、catalog 全体としての価値が下がる

### Users and Scenarios

- プレイヤーは memory、timing、logic、visual hunt、spatial transform、audio 系など幅のあるゲームを切り替えて遊びたい
- 継続利用者は新しいゲームが増えても、既存ゲームと同じルールで選び、遊び、結果を確認したい

### Scope

- Home の catalog へ新しいゲームを継続的に追加する
- 各ゲームを Game、Result、Rankings、Profile の共通導線に載せる
- catalog 全体で mechanic family が偏りすぎないように保つ

### Non-Goals

- 既存ゲームの全面的な差し替え
- 似た見た目だけの reskin を量産すること
- 長時間 run を前提にした game design への移行

### User-Visible Behavior

- Home では新旧のゲームを同じ密度と導線で探索できる
- 新しいゲームでも、How to play、Result、Rankings、Profile の見え方が既存ゲームと揃う
- Catalog 全体として、遊び方のバリエーションを感じられる

### Acceptance Criteria

- 新しいゲームは Home から既存ゲームと同じように起動できる
- 各ゲームの結果と順位は共通の画面パターンで確認できる
- Catalog を一覧したとき、同じ mechanic の焼き直しばかりに見えない

### Edge Cases

- まだプレイ実績がない新規ゲームでも、Home 上で見つけて起動できる
- Catalog が増えても、探索性の悪化で既存ゲームが埋もれない

## Links

- Flow: [screen-flow.md](./screen-flow.md)
- Features: [feature-specs.md](./feature-specs.md)
- UI: [ui-specs.md](./ui-specs.md)
- Catalog Program: [game-catalog-50-expansion-program.md](./game-catalog-50-expansion-program.md)
- Expansion Wave: [games/two-minute-expansion-wave.md](./games/two-minute-expansion-wave.md)
