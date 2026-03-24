# Feature Specs

## External Organizations Sign-In

## Summary

`Arcade` は、home tenant の利用者だけでなく、他 organization の組織アカウント利用者も同じ sign-in 導線から利用できるようにする。

## User Problem

- 同じ tenant の利用者しか sign-in できないと、組織をまたいだ利用拡大ができない
- Sign-in の対象範囲が画面上で分かりづらいと、利用者が試す前に離脱しやすい
- 組織をまたいだ sign-in 後も、公開範囲や shared result の説明が tenant 固定の文言だと誤解を招く

## Users and Scenarios

- home tenant の利用者は、従来どおり組織アカウントで sign-in したい
- 他 organization の利用者は、追加の workaround なしで sign-in したい
- 利用者は sign-in 後も Home、Profile、Rankings、Result を同じ導線で使いたい

## Scope

- 他 organization の組織アカウント利用者も sign-in 対象に含める
- Login、Profile、Result 周辺の文言を tenant 固定ではない表現へ揃える
- Sign-in 後の主要導線は従来どおり Home 起点で提供する

## Non-Goals

- personal Microsoft account の sign-in 対応
- tenant ごとの separate leaderboard の追加
- B2C や External ID への移行

## User-Visible Behavior

- Login 画面では、他 organization の組織アカウントも sign-in 対象として案内される
- Sign-in 後の遷移、Home 起点の使い方、ゲーム体験は従来どおり保たれる
- 共有範囲や公開範囲の説明は、tenant 固定ではなく実際の公開範囲に合う表現になる

## Acceptance Criteria

- 他 organization の組織アカウント利用者が通常の sign-in 導線で利用を開始できる
- home tenant の既存利用者は同じように sign-in と利用を継続できる
- Login、Profile、Result 周辺の文言に tenant 固定前提の説明が残らない

## Edge Cases

- 既存利用者は sign-in 後も自分の実績とプロフィールを継続して参照できる
- 組織アカウントではない利用者には対象外であることが分かる

## Production Game Catalog Synchronization

### Summary

Shipped game は、古い catalog 状態から始まった環境でも Home、Profile、Rankings、direct game route に一貫して現れる必要がある。

### User Problem

- Shipped 済みのゲームが環境によって見えたり見えなかったりすると、Home からの発見や再挑戦が不安定になる
- Profile や Rankings に一部のゲームだけ出ないと、catalog 全体の理解と比較が崩れる
- Direct route が環境差で開けないと、共有や再訪の体験が壊れる

### Users and Scenarios

- プレイヤーは Home で shipped 済みゲームをすべて見たい
- プレイヤーは Profile と Rankings でも同じ lineup を前提に比較したい
- 共有リンクや bookmark から直接ゲームを開く利用者は、環境差を意識せず到達したい

### Scope

- Shipped 済みゲームを Home、Profile、Rankings、direct route で一貫して扱う
- 古い catalog 状態の環境でも shipped lineup が欠けないようにする

### Non-Goals

- ランキング計算式の変更
- Visible lineup 自体の変更
- 未配信ゲームの先行表示

### User-Visible Behavior

- Home では shipped 済みゲームが欠けずに並ぶ
- Profile では favorite game や per-game performance に shipped 済みゲームが揃う
- Rankings と direct game route でも同じ shipped lineup を前提に辿れる

### Acceptance Criteria

- Shipped 済みゲームが環境差で欠落せず、Home、Profile、Rankings で揃って見える
- Direct game route は shipped 済みゲームに対して安定して到達できる
- 新しく追加された shipped game が手動の特別対応なしで visible lineup に入る

### Edge Cases

- まだそのゲームのプレイ実績がない利用者でも、ゲーム自体は一覧に現れる
- 古い環境からの利用者でも、欠けた card や missing route に遭遇しない

## Sound Effects

### Summary

各ゲームの主要操作と run の開始、成功、失敗に短い sound effect を付け、視覚だけに頼らず状態変化を把握しやすくする。

### User Problem

- 視覚だけのフィードバックだと、正誤や状態変化を即座に理解しづらい
- テンポの速いゲームでは、正しい入力や失敗の把握に余計な視線移動が必要になる
- 記憶系や rhythm 系では、音の手掛かりがあると学習しやすい場面がある

### Users and Scenarios

- プレイヤーは正解、誤答、開始、成功、失敗を音でも認識したい
- `Pattern Echo` のような記憶ゲームでは、音が cue として働いてほしい
- 音が使えない環境でも、ゲーム自体は同じように遊べてほしい

### Scope

- Run の開始、成功、失敗に共通の sound effect を付ける
- 各ゲームの主要操作に短い音のフィードバックを付ける
- 音が使えない環境でもゲーム体験を壊さない

### Non-Goals

- BGM や ambient sound の追加
- 音量調整 UI や vibration の追加
- 外部音声ファイルを使った大掛かりな演出

### User-Visible Behavior

- Run 開始時、成功時、失敗時に短い sound effect が鳴る
- 主要操作では正解と誤答、match と mismatch などが音で区別しやすくなる
- `Pattern Echo` では cue に合わせたトーンで記憶を補助する
- 音が使えない環境では無音のまま継続利用できる

### Acceptance Criteria

- 対象ゲームでは、主要な状態変化と入力結果に対応する音の違いを感じ取れる
- 音が鳴らない環境でも、進行不能や layout 崩れが起きない
- 音は短く、プレイの邪魔にならない

### Edge Cases

- 初回操作まで音が始まらない環境でも、最初の入力以降は自然に使える
- 短時間に同系統の音が続いても、状態変化の判別を妨げない

## MCP Primer Learning Quiz

### Summary

`Arcade` に、公開 MCP ドキュメントを読み進めてから約 20 問の確認クイズを解く学習型ゲームを追加する。

### User Problem

- 公開ドキュメントを読むだけでは、重要概念をどこまで理解できたかを確認しづらい
- 学習コンテンツと確認問題が別体験だと、読んだ内容を直後に思い出して使う流れが切れやすい
- MCP の概念は participants、primitives、transport、notifications など論点が広く、短時間で復習しにくい

### Users and Scenarios

- プレイヤーは MCP の公開ドキュメントを数ページで読み、その内容をすぐクイズで確認したい
- プレイヤーは study page でも quiz page でも出典を確認しながら進みたい
- プレイヤーは single-select と multi-select が混在していても、同じ game workspace で迷わず進めたい

### Scope

- MCP の公開ドキュメントをもとにした multi-page study flow を追加する
- study flow を複数 section に分け、対応する quiz flow を同じ run 内で交互に進める
- clear time と mistakes を既存 result model に沿って保存する
- game catalog、preview、workspace registry に新ゲームを追加する

### Non-Goals

- 外部 CMS や remote content fetch を runtime に持ち込むこと
- 問題の自動生成
- クイズ結果に応じた adaptive branching

### User-Visible Behavior

- 新ゲームから MCP の学習型 run を開始できる
- run は topic ごとの study section と対応 quiz section を往復しながら進む
- 各 study page と quiz prompt には、参照した公開ドキュメントの出典が表示され、quiz の正答に必要な事実を section 内の study content から確認できる
- single-select は即時 1 件選択、multi-select は複数選択後に submit する流れで進む
- run clear 時は clear time と mistakes が result に反映される
- `MCP Primer` の study page、quiz prompt、choice copy、explanation、source note、進行ラベルは locale ごとに表示される
- `Tools`、`Resources`、`Prompts`、`Host`、`Client`、`Server`、`Application-driven`、`Model-controlled`、`User-controlled`、`notifications/initialized`、`tools/list` のような MCP canonical term は各 locale でも表記を変えず、説明文や一般語は locale ごとに自然な文章へ翻訳される
- `MCP Primer` の問題文、選択肢、解説は、対応 source に照らして曖昧さや不正確さがない状態に保たれる

### Acceptance Criteria

- study content が複数 section に分かれ、各 section 内で next/back により学習ページを移動できる
- quiz は約 20 問で、single-select と multi-select の両方を含む
- すべての study page と quiz prompt で source attribution を確認できる
- 少なくとも各 quiz section の直前 study content だけで、その section の設問に必要な主要事実を確認できる
- clear と fail の両方が既存 result flow で動作する
- locale を `en` `ja` `zh` `fr` に切り替えると `MCP Primer` の学習本文と quiz 文言が切り替わる
- MCP canonical term と method 名は翻訳された文章の中でも表記が変わらず、それ以外の語句は locale ごとに自然に読める
- source に反する設問や、複数解釈が成立しうる曖昧な choice が残らない

### Edge Cases

- source が複数あっても page 本文や question action が過密にならない
- study page の本文が長い場合でも narrow screen で横スクロール必須にならない
- multi-select 問題で正答数が複数でも、選択状態と submit affordance が曖昧にならない

## IR Primer Learning Quiz

### Summary

`Arcade` に、Stanford の `Introduction to Information Retrieval` を題材にした study-first learning game を追加し、全文検索の基礎概念を読んでから確認クイズで復習できるようにする。

### User Problem

- 全文検索や情報検索の基礎は topic が広く、読むだけでは inverted index、ranking、evaluation の関係を整理しづらい
- Boolean retrieval、postings、tolerant retrieval、tf-idf、MAP などの基礎概念を短時間で往復復習できる場が少ない
- source と quiz が離れていると、どの章のどの説明を根拠に答えるべきかが分かりにくい

### Users and Scenarios

- プレイヤーは Stanford IR book の代表的な章を数ページで読み、その直後に comprehension quiz で理解を確認したい
- プレイヤーは study page と quiz prompt の両方で source attribution を見ながら進みたい
- プレイヤーは全文検索の基礎を、短い run の中で section ごとに段階的に学びたい

### Scope

- `Introduction to Information Retrieval` の HTML edition を source にした multi-page study flow を追加する
- 初回リリースでは全文検索の基礎に絞り、Boolean retrieval、term vocabulary と postings、tolerant retrieval、index construction、ranking、evaluation を section 化する
- section ごとに study page と対応 quiz を同一 run 内で交互に進める
- game catalog、preview、workspace registry、result 保存導線に新ゲームを追加する

### Non-Goals

- IR book 全 21 章を一度に網羅すること
- runtime で外部サイトから本文を取得すること
- adaptive difficulty や理解度に応じた分岐を追加すること

### User-Visible Behavior

- 新ゲーム `IR Primer` から全文検索基礎の学習 run を開始できる
- run は各 topic の study section を読んでから、その section 専用の quiz section へ進む流れで進行する
- 各 study page と quiz prompt には、参照した Stanford IR book HTML edition の出典が表示される
- study page、quiz prompt、choice、review explanation に含まれる数式は、inline `$...$` と block `$$...$$` の記法で入力すると MathJax により読める形で表示される
- quiz では single-select と multi-select が混在しても、既存の learning game layout のまま迷わず進める
- run clear 時は clear time と mistakes が既存 result model に沿って保存される
- `IR Primer` の学習本文、設問、選択肢、解説は、各 section の直前 study content から答えられる範囲に保たれる
- `IR Primer` の study page、quiz prompt、choice copy、explanation、source note は locale ごとに表示される
- `Boolean retrieval`、`inverted index`、`postings list`、`phrase query`、`permuterm index`、`k-gram index`、`BSBI`、`SPIMI`、`tf`、`idf`、`tf-idf`、`Precision at k`、`MAP` のような IR canonical term は各 locale でも表記を変えず、説明文や一般語は locale ごとに自然な文章へ翻訳される

### Acceptance Criteria

- `IR Primer` が Home、direct game route、Result、Profile、Rankings の共通導線に載る
- study content が複数 section に分かれ、各 section 内で next/back により学習ページを移動できる
- quiz は全文検索基礎の主要論点をカバーし、single-select と multi-select の両方を含む
- すべての study page と quiz prompt で source attribution を確認できる
- 少なくとも各 quiz section の直前 study content だけで、その section の設問に必要な主要事実を確認できる
- 数式を含む学習本文や設問を追加した場合、Markdown 中の inline `$...$` と block `$$...$$` がそのまま raw text ではなく MathJax の数式として表示される
- locale を `en` `ja` `zh` `fr` に切り替えると `IR Primer` の学習本文と quiz 文言が切り替わる
- IR canonical term と式の記法は翻訳された文章の中でも表記が崩れず、それ以外の語句は locale ごとに自然に読める
- clear と fail の両方が既存 result flow で動作する

### Edge Cases

- source が複数 chapter にまたがっても、page 本文や source block が過密にならない
- phrase query や wildcard query のような technical term を含んでも、選択肢が複数解釈にならない
- study page の本文が長い場合でも narrow screen で横スクロール必須にならない
