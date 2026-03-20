# Workflow-Owned Azure Delivery Contract

## Summary

production / shared Azure delivery は GitHub Workflow を唯一の control plane entrypoint としつつ、`Private Endpoint` 配下の Azure SQL data-plane 操作は Azure-hosted `Container Apps Job` に限定する。`Container App runtime` は server process の起動だけを担当し、schema change は release / recovery workflow 上の dedicated migration job に分離する。migration job は `prisma migrate deploy` を直接叩かず、checked-in Prisma SQL migrations を Azure-hosted `mssql` runner で適用する。suffix-aware naming contract は維持し、`green` / `blue` / `dev` ごとに hosted environment を独立させる。

## User Problem

現状は `runtime startup`、`Prisma migration`、`Azure SQL principal bootstrap`、`GitHub-hosted workflow` の責務境界が曖昧で、以下が起きやすい。

- `Container App` の replica restart が schema change failure に巻き込まれる
- GitHub-hosted runner では到達できない `Private Endpoint` / `Managed Identity` 前提の処理を workflow 側で担ってしまい、failure reason がぶれる
- release / recovery で必要な permission と preconfiguration が暗黙化し、operator が drift を見落としやすい
- same-suffix rerun 時に partial state を再収束できても、runtime startup failure が hosted rollout 全体を止める

## Users And Scenarios

- operator が routine release を GitHub Release publish で実行する
- operator が `Bootstrap Azure Recovery` を `green` / `blue` / `dev` の任意 suffix に対して rerun する
- operator が Azure SQL principal drift や runtime crash の原因を permission / identity / preconfiguration 単位で切り分ける

## Scope

- `release` / `recovery` workflow の責務分離を明示する
- shared rollout responsibility を reusable workflow に集約し、entry workflow ごとの重複 job 定義をなくす
- GitHub-hosted job と Azure-hosted job の execution surface を分離する
- runtime / migration / SQL bootstrap identity の permission boundary を固定する
- suffix-aware naming contract と same-suffix rerun contract を維持する
- required GitHub Environment variables, secrets, Azure RBAC, SQL grants, registry preconfiguration, network prerequisite を repo docs に明示する
- Azure Front Door 配下でも hashed static asset が `HTML fallback` や compressed-transfer abort に巻き込まれない runtime / edge contract を明示する

## Non-Goals

- production/shared deploy を local Azure CLI path に戻すこと
- `Private Endpoint` を外して GitHub-hosted runner から Azure SQL へ直接接続すること
- runtime identity と migration identity を 1 つに統合すること
- destructive rollback shortcut として `AllowAzureServices` や Azure SQL public access を再導入すること

## User-Visible Behavior

- `Release Azure Delivery` は routine release entry workflow として `publish -> plan_infra -> deploy_infra` までを担当し、その後 shared reusable rollout workflow を call して `sync_runtime_config -> bootstrap_sql -> migrate_database -> deploy_app -> smoke_test` を実行する
- `Bootstrap Azure Recovery` は recovery entry workflow として `resolve_recovery_image -> ensure_resource_group -> deploy_bootstrap_infra -> restore_production_release_rbac` までを担当し、その後同じ shared reusable rollout workflow を call して `sync_runtime_config -> bootstrap_sql -> run_database_migration -> deploy_app -> smoke_test` を実行し、最後に `verify_runtime` を行う
- GitHub-hosted workflow は Azure SQL に直接 login しない
- Azure SQL principal bootstrap は release / recovery の両 workflow で SQL bootstrap identity で動く Azure-hosted `Container Apps Job` が担当する
- schema migration は migration identity で動く Azure-hosted `Container Apps Job` が担当し、checked-in Prisma SQL files を direct `mssql` execution で適用する
- `Container App` の default startup path は migration を待たずに server process を起動する
- runtime `Container App` は runtime identity だけを attach し、migration identity は attach しない
- runtime container env には `AZURE_SQL_RUNTIME_CLIENT_ID` だけが残り、`AZURE_SQL_MIGRATION_CLIENT_ID` と `STARTUP_MIGRATION_DATABASE_URL` は残らない
- suffix-aware naming により `green` / `blue` / `dev` は cross-suffix collision を起こさない
- runtime server は `build/client` と `public` の static file を application routing より前に直接返し、hashed asset には `public, max-age=31536000, immutable` を付ける
- Front Door の asset route は cache を維持しつつ edge compression を有効にせず、origin からの static asset body を途中切断なく配信する
- login / home / game routes の first paint は missing CSS による layout collapse を起こさず、root stylesheet request が practical latency で完了する

## Acceptance Criteria

- GitHub-hosted workflow から Azure SQL `Private Endpoint` への direct data-plane dependency がない
- Azure SQL principal bootstrap と schema migration はどちらも Azure-hosted `Container Apps Job` で実行される
- routine release / recovery entry workflow に duplicated rollout job definition が残らず、shared rollout path は reusable workflow 1 か所で管理される
- `Container App` revision restart や scale-out は schema migration の成否に依存しない
- runtime `Container App` は runtime identity のみを attach し、migration identity attachment は不要になる
- workflow docs に required Azure RBAC, SQL grants, GitHub Environment variables/secrets, registry prerequisite, network prerequisite が列挙されている
- release / recovery workflow は touched YAML validation と local verification を通る
- Front Door default domain から取得する `root-*.css` と route-level `*.css` / `*.js` asset が `200` と expected cache headers を返し、HTML fallback を返さない
- static asset GET は `accept-encoding: identity` workaround を必要とせず browser default request で完走する

## Edge Cases

- target resource group に同一 type resource が複数ある場合は fail fast する
- same-suffix rerun では active resource または recoverable resource を優先して reuse / recover する
- `App Configuration` / `Key Vault` の global-name collision は operator-managed suffix rotation で逃がせる
- registry access が `identity` か `username/password` のどちらでもない場合は `Container Apps Job` 作成前に fail する
- migration job が fail した場合、`deploy_app` は進まない

## Constraints And Dependencies

- production/shared environment の deploy は GitHub Workflow 経由のみ
- GitHub-hosted runner は Azure SQL `Private Endpoint` に直接到達しない前提を守る
- Azure SQL は `Entra-only` auth, `publicNetworkAccess=Disabled`, `Private Endpoint` を維持する
- `Container App` runtime config は GitHub Workflow が App Configuration / Key Vault / Container App env contract を収束させる
- shared app identity や Entra app registration など human-managed shared identity は suffix ごとに複製しない

## Links

- Active plan: `/docs/plans/plan.md`
- Azure prerequisites: `/docs/azure-prerequisites.md`
- Production data path: `/docs/production-data-path.md`
