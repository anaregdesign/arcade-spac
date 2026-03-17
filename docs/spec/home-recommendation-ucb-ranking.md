# Home Recommendation UCB Ranking

## Summary

ホーム画面のゲーム一覧を、ユーザ行動履歴に基づく recommendation で並び替える。推薦ロジックは contextual multi-armed bandit の UCB を使用し、プレイ継続や拡散行動を反映して表示順を更新する。

## User Problem

- 現状のゲーム一覧は利用者の行動を十分に反映せず、次にプレイしたいゲームを見つけにくい
- リザルト画面での共有など、満足度が高い行動がランキングに反映されない
- プレイ中断などの離脱シグナルを扱えないため、表示順の最適化が進まない

## Users and Scenarios

- 利用者はホーム画面を開いたとき、自分に合いそうなゲームが上位に並んでいてほしい
- 利用者がゲームを最後までプレイしたり共有リンクを取得した場合、次回以降の推薦に反映されてほしい
- 運用者は全ユーザからのフィードバックを使って、推薦精度を継続的に改善したい

## Scope

- ホーム画面のゲーム一覧を recommendation スコア順に並び替える
- recommendation は contextual multi-armed bandit (UCB) を用いて計算する
- フィードバック蓄積用に `UserFeedbackLogs` テーブルを追加する
- 初期学習（bootstrap）で `UserFeedbackLogs` の直近 1000 件を使用する
- 新規フィードバックを受け取り次第、モデルをリアルタイム更新する
- 学習済みモデルは全ユーザで共有する

## Non-Goals

- ホーム画面のカードデザインやレイアウト変更
- ゲームルールやスコア計算ロジックの変更
- ユーザごとに完全分離した個別モデルの運用
- 外部広告データや外部トラッキングデータの導入

## User-Visible Behavior

- ホーム画面では、ゲーム一覧が recommendation によって動的にソートされる
- ゲームのリザルト到達や共有リンク取得などのポジティブ行動後、次回以降の表示順に反映される
- プレイ中断などのネガティブ行動が続くゲームは、相対的に順位が下がる場合がある
- 推薦モデルは全ユーザ共有のため、全体の行動傾向が表示順に反映される

## Acceptance Criteria

- ホーム画面のゲーム一覧が、contextual bandit UCB のスコア順で表示される
- `UserFeedbackLogs` にフィードバックイベントが保存され、`loggedAt` 降順で取得できる
- `Game.id` は `Int` として保持され、UCB 内部の行列・ベクトルはこの値をインデックスとして利用する
- positive context に以下の行動が含まれる
  - ゲームのリザルト画面への到達
  - リザルト画面の共有ボタン経由でのリンク取得
  - ゲームのプレイ継続・拡散に該当する追加行動（定義済みイベント）
- negative context にプレイ中断が含まれる
- モデル初期化時に `UserFeedbackLogs` の最新 1000 件を学習入力として使用する
- フィードバック受信後、推薦モデル更新がリアルタイムで反映される
- 推薦モデルはユーザ間で共有され、特定ユーザ専用モデルとして分離されない

## Edge Cases

- ログ件数が 1000 件未満でも、取得できる最新ログ全件で初期化を行う
- 新規リリース直後など十分なログがない期間は、既定順（安定した fallback 順）で表示できる
- 同一イベントの重複送信が発生しても、ログ時刻順で再学習可能な形式を維持する
- 一時的に学習更新が遅延しても、ホーム画面表示は継続できる

## Constraints and Dependencies

- フィードバックログは user-facing behavior の追跡に使うため、時系列参照が容易な `loggedAt` を必須とする
- recommendation 学習は直近ログに依存するため、`loggedAt` 降順の取得性能を担保する（index 等の具体実装は別設計）
- recommendation の内部インデックスは `Game.id` (`Int`) を使用し、キー変換時の不整合を防ぐ
- 本仕様は first version とし、context 種別や重み付けは今後の具体要件で更新可能とする
- active execution tracker は `/docs/plans/plan.md` を使用する

## Links

- Related: [product-specs.md](./product-specs.md)
- Related: [ui-specs.md](./ui-specs.md)
- Plan: [../plans/plan.20260317-144716.md](../plans/plan.20260317-144716.md)
