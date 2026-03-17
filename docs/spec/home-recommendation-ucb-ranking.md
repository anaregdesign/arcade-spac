# Home Recommendation UCB Ranking

## Summary

ホーム画面のゲーム一覧を、ユーザ行動履歴に基づく recommendation で並び替える。推薦ロジックは contextual multi-armed bandit を採用し、デフォルト推論は Thompson Sampling を使用する。UCB 推論は比較・検証用として併存可能とし、プレイ継続や拡散行動を反映して表示順を更新する。

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

- ホーム画面のゲーム一覧が、contextual bandit Thompson Sampling 推論のスコア順で表示される
- UCB 推論ロジックは互換維持され、必要時に比較検証へ利用できる
- `UserFeedbackLogs` にフィードバックイベントが保存され、`loggedAt` 降順で取得できる
- `Game.id` は `Int` として保持され、UCB 内部の行列・ベクトルはこの値をインデックスとして利用する
- positive context に以下の行動が含まれる
  - ゲームのリザルト画面への到達
  - リザルト画面での共有ボタン押下（Teams 共有の実行）
  - 共有リンク経由での共有リザルト閲覧
  - リザルト画面からの再プレイ遷移
  - ゲームのプレイ継続・拡散に該当する追加行動（定義済みイベント）
- negative context に以下の行動が含まれる
  - プレイ中断 (`RUN_ABANDONED`)
  - クリア失敗 (`RUN_FAILED`)
  - 短時間でのプレイ中断 (`RUN_QUICK_ABANDONED`)
- モデル初期化時に `UserFeedbackLogs` の最新 1000 件を学習入力として使用する
- フィードバック受信後、推薦モデル更新がリアルタイムで反映される
- フィードバック受信時に増分学習（online update）を実行し、ホーム表示時は学習済み状態で推論する
- 推薦モデルはユーザ間で共有され、特定ユーザ専用モデルとして分離されない
- release workflow は pending Prisma migrations を app 配信前に適用し、`UserFeedbackLog` を含む recommendation 依存スキーマを常に先行反映する

## Edge Cases

- ログ件数が 1000 件未満でも、取得できる最新ログ全件で初期化を行う
- 新規リリース直後など十分なログがない期間は、既定順（安定した fallback 順）で表示できる
- 同一イベントの重複送信が発生しても、ログ時刻順で再学習可能な形式を維持する
- 一時的に学習更新が遅延しても、ホーム画面表示は継続できる
- migration に失敗した release は app revision を正常起動させず、壊れた recommendation 依存コードを先に配信しない

## Constraints and Dependencies

- フィードバックログは user-facing behavior の追跡に使うため、時系列参照が容易な `loggedAt` を必須とする
- recommendation 学習は直近ログに依存するため、`loggedAt` 降順の取得性能を担保する（index 等の具体実装は別設計）
- recommendation の内部インデックスは `Game.id` (`Int`) を使用し、キー変換時の不整合を防ぐ
- デフォルト推論は Thompson Sampling を採用し、探索と活用のバランスを推論側で自然に扱う
- recommendation ロジックは UCB 固有名に依存しない汎用サービスとして管理し、実装は class ベースで提供する
- ホーム表示リクエストごとの `UserFeedbackLogs` 全再走査を避け、bootstrap 済みモデル + 増分学習で運用する
- release 時の schema 反映は GitHub Workflow 経由で強制し、app revision は pending migration 適用後に起動させる
- 本仕様は first version とし、context 種別や重み付けは今後の具体要件で更新可能とする

## Links

- Related: [product-specs.md](./product-specs.md)
- Related: [ui-specs.md](./ui-specs.md)
- Related: [home-recommendation-algorithm-technical-spec.md](./home-recommendation-algorithm-technical-spec.md)
- Plan: [../plans/plan.20260317-220308.md](../plans/plan.20260317-220308.md)
