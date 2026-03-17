# Home Recommendation Algorithm Technical Specification

## Summary

ホーム画面 recommendation の最終実装は、全ユーザ共有の contextual bandit 学習状態をサーバプロセス内で保持し、ホーム表示時は Thompson Sampling を既定推論として利用する。学習入力は `UserFeedbackLog` の最新 1000 件で bootstrap し、その後は新規フィードバックを受信するたびに増分学習する。

## Technical Goal

- ホーム画面のゲーム並び順を、全ユーザの行動から学習した共有モデルで更新する
- 推論時にはユーザごとのプレイ履歴から生成した context を使い、同じ共有モデルでもユーザごとに異なる順位を返せるようにする
- ホーム表示時の全ログ再走査を避け、プロセス内の学習済み状態から直接推論する
- UCB を比較用に残しつつ、既定の ranking は Thompson Sampling に統一する

## Scope

- ホーム画面候補の context 生成
- recommendation feedback event の reward 化と context 化
- 共有 learning state の bootstrap、保持、増分更新
- Thompson Sampling と UCB の score 計算
- `UserFeedbackLog` 永続化と最新ログ取得

## Non-Goals

- ゲームそのもののスコア計算やランキング集計の仕様変更
- ユーザ専用モデルの永続化
- 学習パラメータの自動最適化
- プロセス間でのリアルタイム同期

## Runtime Overview

1. ホーム表示時に、全ゲームを candidate として組み立てる。
2. 各 candidate には `Game.id` を arm index として設定し、ユーザ別の home context と legacy base score を付与する。
3. サーバプロセス内の共有モデルが未初期化なら、`UserFeedbackLog` 最新 1000 件から learning state を構築する。
4. 推論は learning state に対して Thompson Sampling を実行し、score 降順でゲームを並べる。
5. リザルト閲覧、再プレイ、共有、離脱などの feedback event を保存すると、同一プロセス内の共有 learning state に即時反映する。

## Data Model

### Arm

- arm はゲーム単位
- arm index は `Game.id: Int`
- arm key は route 表示用の game key だが、学習状態の添字としては使わない

### Feedback Log

`UserFeedbackLog` は以下を保持する。

- `userId`
- `gameId`
- `eventType`
- `reward`
- `contextKey`
- `loggedAt`

取得は `loggedAt` 降順を前提とし、bootstrap では最新 1000 件を使う。

### Learning State

learning state は以下の配列・集計で構成する。

- `globalCounts[armIndex]`
- `globalSums[armIndex]`
- `contextStatsByKey.get(contextKey).counts[armIndex]`
- `contextStatsByKey.get(contextKey).sums[armIndex]`
- `totalObservations`
- `vectorLength`

新しい `gameId` が既存の配列長を超える場合は、各配列をゼロ埋めで拡張する。

## Context Model

### Home Context

ホーム推論の context はユーザごとのプレイ履歴から生成する。

- `playCount <= 0` の場合: `engagementSegment=explore`, `surface=home`
- `completedCount < playCount` の場合: `engagementSegment=churn-risk`, `surface=home`
- それ以外: `engagementSegment=engaged`, `surface=home`

このため、学習モデル自体は全ユーザ共有でも、推論入力の context はユーザ別になる。

### Feedback Context

feedback event は event type ごとに固定 context へ変換する。

- `SHARE_LINK_GENERATED`, `SHARE_TO_TEAMS_CLICKED`: `advocacy/result`
- `SHARED_RESULT_VIEWED`: `advocacy/shared-result`
- `RESULT_REPLAY_REQUESTED`: `engaged/gameplay`
- `RUN_ABANDONED`, `RUN_QUICK_ABANDONED`, `RUN_FAILED`: `churn-risk/gameplay`
- 上記以外の結果系 event: `engaged/result`

### Context Key

context は `key=value` の文字列へ正規化して集計する。

- `null`, `undefined`, 空文字は除外
- key は辞書順でソート
- 何も残らなければ `global`

## Feedback Reward Model

実装済み reward は次の通り。

| Event Type | Reward |
| --- | ---: |
| `RUN_FAILED` | -2 |
| `RUN_QUICK_ABANDONED` | -4 |
| `RUN_ABANDONED` | -3 |
| `RESULT_VIEWED` | 2 |
| `RESULT_COMPLETED` | 3 |
| `RESULT_REPLAY_REQUESTED` | 3 |
| `SHARED_RESULT_VIEWED` | 4 |
| `SHARE_LINK_GENERATED` | 4 |
| `SHARE_TO_TEAMS_CLICKED` | 5 |

未定義の event type は reward `0` とし、learning 対象外とする。

## Candidate Construction

ホーム画面 candidate は全ゲームから生成し、各ゲームに以下を付与する。

- `armIndex = Game.id`
- `context = buildHomeRecommendationContext({ completedCount, playCount })`
- `baseScore = legacy home recommendation score`

legacy base score の式は以下。

```text
(playCount === 0 ? 1_000_000 : 0)
+ (currentRank ? 10_000 - currentRank : 0)
+ bestCompetitivePoints
```

既定の `baseScoreWeight` は `1e-6` なので、legacy score は tie-break と cold-start 補助に近い役割を持つ。

## Bootstrap And Shared Model Lifecycle

- shared model はサーバプロセス単位の singleton として保持する
- 初回 ranking または初回 feedback 処理時に lazy initialize する
- initialize 時は `UserFeedbackLog` 最新 1000 件を読み、learning state を再構築する
- bootstrap 後はメモリ上の learning state を使い回す
- プロセス再起動時は再度ログから bootstrap する

現在の実装では、共有モデルは「全ユーザ共有」だが「全プロセス共有」ではない。複数プロセス構成では、永続化された feedback log を介して整合を取る。

## Release-Time Migration Sequence

release image には Prisma CLI と `prisma/migrations` を含める。Container App revision は server 起動前に pending migration を適用する。

1. app revision 起動時に App Configuration / Key Vault から `DATABASE_URL` を解決する
2. `AZURE_SQL_MIGRATION_CLIENT_ID` を `AZURE_CLIENT_ID` として migration 実行プロセスへ渡す
3. `npm run db:migrate:deploy` を実行する
4. migration 成功後に `react-router-serve` を起動する

migration 用の Azure SQL 権限は user-assigned migration identity に閉じ込め、通常の app runtime は system-assigned identity で動作する。

`/health` は recommendation 依存スキーマも検証し、`UserProfile` と `UserFeedbackLog` の両方に問い合わせて migration 漏れを smoke test で検知する。

## Online Learning

新しい feedback event を受け取ると、次の順で処理する。

1. event type を reward に変換する
2. event type を feedback context に変換し、`contextKey` を構築する
3. `UserFeedbackLog` に永続化する
4. shared model が初期化済みであれば、同じ feedback を learning state に即時反映する

増分学習では以下を更新する。

- `globalCounts[armIndex] += 1`
- `globalSums[armIndex] += reward`
- `contextCounts[armIndex] += 1`
- `contextSums[armIndex] += reward`
- `totalObservations += 1`

feedback 記録は best-effort であり、モデル初期化に失敗してもログ保存は継続する。ログ保存自体に失敗した場合のみ、その feedback は破棄される。

## Thompson Sampling Ranking

### Defaults

- `baseScoreWeight = 1e-6`
- `coldStartBonus = 0.65`
- `contextWeight = 0.72`
- `globalWeight = 0.28`
- `priorAlpha = 1`
- `priorBeta = 1`
- `rewardMin = -5`
- `rewardMax = 5`

### Posterior Construction

reward は `[-5, 5]` を `[0, 1]` へ正規化して posterior に使う。

```text
normalizedReward = clamp((reward - rewardMin) / (rewardMax - rewardMin), 0, 1)
```

context 系と global 系について、それぞれ以下を計算する。

```text
normalizedSum = count * normalize(meanReward)
alpha = priorAlpha + normalizedSum
beta = priorBeta + (count - normalizedSum)
```

context と global の両方がある場合、prior からの増分を重み付きで合成する。

```text
alpha = priorAlpha
  + (contextAlpha - priorAlpha) * contextWeight
  + (globalAlpha - priorAlpha) * globalWeight

beta = priorBeta
  + (contextBeta - priorBeta) * contextWeight
  + (globalBeta - priorBeta) * globalWeight
```

context のみ、または global のみ観測がある場合は、その posterior をそのまま使う。

### Sampling And Score

1. `Beta(alpha, beta)` から success rate を 1 回 sample する
2. sample 値を reward 空間 `[-5, 5]` に戻す
3. `observationCount === 0` なら `coldStartBonus` を加える
4. `baseScore * baseScoreWeight` を加える

最終 score は以下。

```text
score = sampledReward + coldStartBonus + baseScoreBonus
```

並び順は `score desc`、同点時は `observationCount desc`、最後に `armKey asc`。

## UCB Compatibility Ranking

UCB 実装は比較検証用として残している。既定 routing では使わないが、同じ learning state から計算可能。

### Defaults

- `baseScoreWeight = 1e-6`
- `coldStartBonus = 0.65`
- `contextWeight = 0.72`
- `globalWeight = 0.28`
- `explorationWeight = 1.15`
- `rewardMin = -5`
- `rewardMax = 5`

### Score

平均報酬は context 平均と global 平均を重み付きで混合する。

```text
meanReward = contextMean * contextWeight + globalMean * globalWeight
```

探索項は以下。

```text
explorationBonus =
  explorationWeight
  * sqrt(log(max(1, totalObservations) + 1) / max(1, observationCount))
```

最終 score は以下。

```text
score = meanReward + explorationBonus + coldStartBonus + baseScoreBonus
```

## Failure And Consistency Characteristics

- ranking path は bootstrap 成功を前提とする
- feedback path は best-effort で、推薦関連エラーで user-facing flow を止めない
- shared model はプロセスローカルなので、別プロセスの増分更新は即時反映されない
- 再起動後は永続化済みログから再学習するため、状態は eventually 回復する
- release 時の migration が失敗した場合、その revision は server 起動前に失敗し、未反映 schema のまま recommendation 依存コードを配信しない

## Tunable Parameters

現在コードで調整可能な主要パラメータは以下。

- Thompson Sampling: `baseScoreWeight`, `coldStartBonus`, `contextWeight`, `globalWeight`, `priorAlpha`, `priorBeta`, `rewardMin`, `rewardMax`
- UCB: `baseScoreWeight`, `coldStartBonus`, `contextWeight`, `globalWeight`, `explorationWeight`, `rewardMin`, `rewardMax`
- bootstrap 件数: `1000`

## Verification Baseline

- unit test で context key、reward mapping、UCB ranking、Thompson Sampling ranking、learning state からの ranking 一致、増分学習を検証する
- typecheck により recommendation 関連の module boundary と型整合を検証する

## Links

- Related: [home-recommendation-ucb-ranking.md](./home-recommendation-ucb-ranking.md)
- Plan: [../plans/plan.20260317-220859.md](../plans/plan.20260317-220859.md)
