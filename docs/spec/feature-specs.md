# Feature Specs

## External Organizations Sign-In

## Summary

`Arcade` を single-tenant `Microsoft Entra ID` sign-in から、他 tenant の組織アカウントでも sign-in できる `organizations-only` の multi-tenant sign-in へ拡張する。

## User Problem

- 現在の production app は同一 tenant の user しか sign-in できない
- 他 organization の user が app を試したり継続利用したりできない
- multi-tenant sign-in を app registration だけで広げると、user identity の衝突や古い tenant-only 文言が残る risk がある

## Users and Scenarios

- home tenant の user は従来どおり `Microsoft Entra ID` で sign-in したい
- 他 tenant の organization account user は追加の manual workaround なしで sign-in したい
- 運用者は external sign-in を有効化したあとも、profile、rankings、shared result の user-facing copy が誤解を招かない状態を保ちたい

## Scope

- `Microsoft Entra ID` app registration を `AzureADMultipleOrgs` に変更する
- app runtime の authority と token validation を organizations multi-tenant sign-in に対応させる
- internal user identity を tenant-qualified にして、別 tenant user と collision しないようにする
- login、profile、privacy、terms、result 周辺の user-facing copy を tenant-only 前提から更新する
- production に反映し、hosted sign-in entrypoint が multi-tenant 用 authority を使うことを確認する

## Non-Goals

- personal Microsoft account (`AzureADandPersonalMicrosoftAccount`) の sign-in 対応
- tenant ごとの separate leaderboard や data partitioning の追加
- B2C や External ID への移行

## User-Visible Behavior

- login screen では、home tenant user だけでなく他 organization の `Microsoft Entra ID` account も sign-in 対象として案内される
- sign-in ボタンからの authorization request は tenant 固定 endpoint ではなく organizations multi-tenant endpoint を使う
- sign-in 後の app behavior は従来どおり `/home` を起点に動作する
- visibility や shared result の説明文は「tenant 内」ではなく、現在の公開範囲に合う表現で表示される

## Acceptance Criteria

- production の `Microsoft Entra ID` app registration が `AzureADMultipleOrgs` になっている
- hosted app の authorization request が `organizations` endpoint を使う
- app code は `tenantId + objectId` を前提に user identity を扱い、multi-tenant user collision を避ける
- local verification が通る
- production deploy 後の `/health` と smoke test が成功する
- relevant spec / operations docs が multi-tenant sign-in behavior を反映している

## Edge Cases

- existing home tenant users は sign-in 後も同じ internal user record に紐づくこと
- token から tenant identifier を取得できない場合は sign-in を完了させないこと
- external org sign-in を有効化しても personal Microsoft account は sign-in 対象に含めないこと

## Constraints and Dependencies

- 既存の server-side OIDC callback と cookie session を維持する
- production DB は multi-tenant identity key に対応する schema へ更新する

## Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [../azure-prerequisites.md](../azure-prerequisites.md)
- Related: [../production-operations.md](../production-operations.md)

## Production Game Catalog Synchronization

### Summary

Production must always show the full phase 1 game lineup on Home, Profile, Rankings, and direct game routes even when the hosted database was created before later games were added.

### User Problem

- Production currently shows only two games when the hosted database still contains the original catalog rows.
- Users cannot discover, open, or select the newer games even though the app code and specs define a six-game phase 1 lineup.
- Operations currently depend on seed timing or manual catalog repair, which makes hosted behavior drift from the shipped product.

### Users and Scenarios

- A signed-in player opens Home in production and expects to see the full phase 1 lineup.
- A player opens Profile and expects every shipped game to appear in favorite-game selection and per-game performance sections.
- A player or shared link opens a direct game route for a shipped title and expects the route to work even if the database started from an older catalog snapshot.
- An operator deploys a newer app version and expects the hosted runtime to reconcile missing catalog rows without a separate manual seed step.

### Scope

- Ensure the canonical persisted game catalog for phase 1 is defined in one code-owned source.
- Ensure production-backed repository reads can reconcile missing game rows before they are needed by Home, Profile, Rankings, and gameplay flows.
- Keep local fixture data and seed data aligned with the same canonical game metadata.

### Non-Goals

- Reworking score aggregation or ranking formulas.
- Backfilling historical play results for games that were never played.
- Changing the visible six-game phase 1 lineup itself.

### User-Visible Behavior

- Production Home shows all six shipped phase 1 games instead of only the older two rows.
- Profile uses the full shipped lineup for favorite-game selection and per-game sections even for older tenants.
- Rankings and direct game routes resolve every shipped game from the same canonical catalog.
- A hosted deployment no longer requires a manual seed run just to make newly shipped games visible.

### Acceptance Criteria

- Production-backed Home returns the full six-game lineup when the database is missing newer catalog rows.
- Production-backed Profile and Rankings return the same full lineup without requiring fixture fallback.
- Direct route lookup for a shipped game succeeds after repository-level catalog reconciliation.
- Seed data and runtime catalog reconciliation use the same game metadata source so shipped names and descriptions do not drift.

### Edge Cases

- Existing users with no per-game summary rows for newly reconciled games still see those games with zeroed summary values instead of missing cards.
- Reconciliation is safe to run repeatedly and does not create duplicate game rows.
- Local development fixture fallback still behaves as before when the database is unavailable.

### Constraints and Dependencies

- The canonical phase 1 lineup remains `Minesweeper`, `Sudoku`, `Precision Drop`, `Color Sweep`, `Number Chain`, and `Pair Flip`.
- Prisma access stays inside server infrastructure.

### Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [product-specs.md#game-catalog-expansion](./product-specs.md#game-catalog-expansion)

## Sound Effects

### Summary

各ゲームの操作に対して、Web Audio API による合成音の効果音を追加する。外部音声ファイルは使用せず、すべての音はブラウザ上でリアルタイムに合成する。

### User Problem

- 操作のフィードバックが視覚のみであり、正誤や状態変化が直感的に伝わりにくい
- 音がないと、正しい tap をしたか、ゲームが終了したか、確認に時間がかかる
- 効果音があることで、ゲームのリズム感と没入感が向上する

### Users and Scenarios

- ユーザが pad を tap すると、正解・誤答で異なる音でフィードバックを受けたい
- ユーザが run を開始・クリア・失敗したとき、音で状態変化をすぐに認識したい
- Pattern Echo では、watch phase 中に pad flash と同時に音階のトーンを聞くことで記憶を補助したい

### Scope

- 全 7 ゲームの主要操作に合成効果音を追加する
- run 開始・クリア・失敗の共通サウンドイベントを実装する
- 各ゲーム固有の操作サウンドを実装する
  - Pattern Echo: pad flash に音階トーン、correct/wrong tap
  - Pair Flip: card flip、card match、card mismatch
  - Color Sweep: correct tile tap、wrong tile tap
  - Minesweeper: cell reveal、mine explosion、flag on/off
  - Number Chain: correct tap、wrong tap
  - Sudoku: correct digit、wrong digit、hint use
  - Precision Drop: ball capture

### Non-Goals

- 音声ファイル（.mp3/.wav/.ogg）の追加
- BGM やアンビエント音の追加
- 音量調整 UI や ミュート設定の追加
- バイブレーションフィードバックの追加

### User-Visible Behavior

- run 開始ボタンを押すと短い上昇トーンが鳴る
- run クリア時に上昇アルペジオの勝利音が鳴る
- run 失敗時に下降トーンが鳴る
- Pattern Echo の watch phase で、pad が flash するたびに対応する音階のトーンが鳴る
- Pattern Echo の input phase で、正しい pad を tap すると軽快な音が、間違えると低い buzz 音が鳴る
- Pair Flip でカードを flip すると短い click 音が鳴り、match 成立で快音、mismatch でこもった音が鳴る
- Color Sweep で target tile を tap すると正解音、wrong tile で誤答音が鳴る
- Minesweeper で safe cell を reveal すると soft pop 音、mine を踏むと爆発音が鳴り、flag を立てる/外すと click 音が鳴る
- Number Chain で正しい数字を tap すると正解音、間違えると誤答音が鳴る
- Sudoku でキーパッドまたはキーボードから正しい数字を入力すると正解音、間違えると誤答音が鳴り、hint 使用時に別の音が鳴る
- Precision Drop でボールを capture すると impact 音が鳴る

### Acceptance Criteria

- 全 7 ゲームで主要操作に対応する効果音が再生される
- AudioContext が利用できない環境（SSR、一部ブラウザ）では音が鳴らないがゲームは正常に動作する
- 新規 npm パッケージへの依存がない
- TypeScript 型検査が通る

### Edge Cases

- AudioContext が suspended 状態のとき（ブラウザの autoplay policy）、最初のユーザ操作で resume されてから音が鳴る
- SSR 環境では window が存在しないため AudioContext は作成されない
- 同じ効果音が連続して短時間に重なっても互いを妨げない

### Constraints and Dependencies

- Web Audio API（ブラウザ標準）のみを使用し、外部音声ライブラリは追加しない
- 全音は OscillatorNode と GainNode による合成で生成する

### Links

- Related: [games/pattern-echo-game.md](./games/pattern-echo-game.md)
- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
