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
