# Operations Specs

## Azure Private SQL And Entra Hardening

## Summary

`Arcade` の Azure hosting を、Azure SQL public endpoint 依存から `Private Endpoint` 前提の構成へ切り替え、`Microsoft Entra ID` を前提にした runtime contract と運用手順を `azure-app-platform-delivery` の best practice に揃える。

## User Problem

- 現在の Azure SQL connectivity は public endpoint と `AllowAzureServices` firewall rule に依存しており、`azure-app-platform-delivery` の推奨構成と一致していない
- App Configuration と Key Vault も public access 前提のままで、Azure 側の private networking 方針とずれている
- repository の verification と runbook も public SQL contract を正としているため、private path への移行後に誤った運用を誘発する

## Users and Scenarios

- 運用者は Azure Container Apps から Azure SQL へ private path で接続できる構成を repository で再現したい
- 運用者は Azure SQL の runtime auth が `Microsoft Entra ID` と least privilege role を前提にしていることを前提条件として扱いたい
- 開発者は IaC、verification script、README、operations runbook を見れば current production contract を誤解なく追える状態を必要とする

## Scope

- `infra/main.bicep` を VNet-integrated Container Apps と Azure SQL `Private Endpoint` 前提へ更新する
- Azure SQL public network access と `AllowAzureServices` firewall 依存を repository contract から外す
- App Configuration と Key Vault の hosted access を private endpoint 前提へ更新する
- app runtime の config bootstrap を Azure App Configuration と Key Vault を source of truth とする形へ寄せる
- Container App の health probe と production verification を private-connectivity 前提へ更新する
- README と Azure operations docs を現在の network and auth contract に合わせて更新する

## Non-Goals

- production や shared environment への直接 deploy
- app の game behavior や UI flow の変更
- local development を mandatory に `Microsoft Entra ID` sign-in へ切り替えること

## User-Visible Behavior

- internet-facing app ingress は public のまま維持される
- hosted runtime は Azure SQL public endpoint ではなく VNet-integrated outbound path と private DNS を通じて Azure SQL へ接続する
- Azure SQL は `Microsoft Entra ID` admin と `Entra-only` auth を前提に運用される
- runtime は Azure App Configuration から non-secret settings を読み、Key Vault から secrets を取得できる
- README と operations docs を読むと、Azure SQL public access を戻すのではなく private path を維持・検証する運用手順が示される
- production verification は private networking contract に沿って pass/fail する

## Acceptance Criteria

- `infra/main.bicep` が delegated subnet を持つ VNet-integrated Container Apps environment と separate private-endpoint subnet を定義している
- `infra/main.bicep` が Azure SQL `Private Endpoint` と `privatelink.database.windows.net` private DNS link を定義し、Azure SQL public network access を `Disabled` にしている
- hosted App Configuration と Key Vault が private endpoint 前提の access contract へ更新されている
- server-side runtime config bootstrap が Azure App Configuration と Key Vault を使って config を解決できる
- runtime config を stores へ同期するための repository-side bootstrap path が用意されている
- Container App の health probe が `/health` に向く explicit HTTP probe として定義されている
- production verification script が public firewall contract ではなく private networking contract を検証する
- README、`docs/azure-prerequisites.md`、`docs/production-operations.md`、`docs/production-data-path.md` が新しい contract と未検証事項を反映している

## Edge Cases

- app ingress は public のままでも、Azure SQL connectivity だけ private path にできることを明確に示す
- SQL admin login/password は bootstrap-only または break-glass とし、runtime auth に流用しない
- runtime identity と migration identity の分離は維持し、runtime identity に DDL 系 privilege を与えない
- private DNS の実解決確認が CI runner 単体で完結しない場合は、control-plane verification と hosted-path residual risk を明記する

## Constraints and Dependencies

- deploy path は引き続き GitHub Workflow を使い、local agent から production deploy は行わない
- Azure SQL `Microsoft Entra ID` admin、VNet、subnet、private DNS、private endpoint approval は Azure side prerequisite として必要になる
- live Azure resource への config 同期は private data plane に到達できる host が必要で、image deploy は release workflow に依存する

## Links

- Related Skill: [../../.github/skills/azure-app-platform-delivery/SKILL.md](../../.github/skills/azure-app-platform-delivery/SKILL.md)
- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [#production-recovery-and-redeploy](#production-recovery-and-redeploy)
- Related: [../azure-prerequisites.md](../azure-prerequisites.md)

## Production Recovery And Redeploy

### Summary

Azure 上で公開中の `Arcade` が利用できない状態を解消し、原因に対応したうえで再デプロイして、公開 URL から正常に遊べる状態を維持する。

### User Problem

- 現在デプロイされている app が動いておらず、公開 URL から game を利用できない
- この状態のまま再デプロイしても、root cause が残っていると同じ障害が再発する
- production recovery の手順と確認基準が docs から一貫して追えない

### Users and Scenarios

- 運用者は production の公開 URL がなぜ動かないのかを把握したい
- 運用者は root cause を修正してから、安全に再デプロイしたい
- 利用者は redeploy 後に home、gameplay、rankings などの主要画面を再び正常に利用したい

### Scope

- 現在 Azure に出ている `Arcade` の symptom、revision、runtime logs、deployment state を確認する
- 障害の root cause を code、config、infra、runtime 設定のいずれかで特定し、必要な修正を行う
- 今回の SQL network drift のような production data path 断絶を再度見逃さないための verification を repository に追加する
- production release 前に local verification を実施し、その結果を踏まえて GitHub release workflow 経由で deploy する
- 修正後に production へ再デプロイし、health と smoke test で復旧を確認する
- 必要であれば運用ドキュメントを現在の recovery 手順に合わせて更新する

### Non-Goals

- 今回の障害対応と無関係な UI refresh や game rules の変更
- 新しい Azure platform への移行
- 長期的な observability 強化の全面実装

### User-Visible Behavior

- 公開 URL にアクセスすると app shell と主要画面が表示される
- `/health` が success を返す
- gameplay 開始、result 表示、rankings 参照など主要導線が smoke test で確認できる
- 障害原因が再デプロイ後も残らないよう、必要な修正が反映される

### Acceptance Criteria

- operations docs と verification guidance が failure symptom、root cause、recovery check を説明している
- root cause に対応する修正が repository へ反映されている
- production SQL server の network policy drift を検知できる verification が repository に追加されている
- release 対象 commit に対して local verification の成功が確認されている
- redeploy 後の production `/health` が success を返す
- redeploy 後の smoke test が成功する
- 必要な運用ドキュメント更新が repository に反映されている

### Edge Cases

- code 変更なしで rollback または configuration 修正だけで復旧できる場合でも、その recovery path を docs で区別できる
- 失敗が Azure runtime 側ではなく dependency や secret/config drift にある場合でも、再デプロイ前に解消する
- 最新 revision が ready でも app が正常動作しない場合は、health と主要導線の実確認を優先する

### Constraints and Dependencies

- production 確認は Azure 上の実リソースに対して行う
- recovery は既存の Container App delivery path と整合した方法で行う
- Azure SQL private networking への全面移行は別 requirement とし、その後続対応は [#azure-private-sql-and-entra-hardening](#azure-private-sql-and-entra-hardening) で扱う

### Links

- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Related: [../production-operations.md](../production-operations.md)
