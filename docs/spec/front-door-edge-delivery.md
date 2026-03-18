# Front Door Edge Delivery

## Summary

`Arcade` の公開配信入口を `Azure Container Apps` 直結から `Azure Front Door Premium` 経由へ切り替え、edge からの配信、origin の private connectivity、release 後の Front Door 基準 verification を repository contract として成立させる。

## User Problem

- 現在の production runtime は `Container App` の public FQDN をそのまま公開 URL として使っている
- この構成では global edge routing、Front Door の caching/compression、WAF 拡張、origin shielding の前提が作れない
- 認証付きの dynamic app に対して全面 CDN cache を入れるのは不適切だが、現状は Front Door を入口にした selective edge cache の contract もない
- smoke test、runbook、runtime public URL が `Container App` 直結前提のままで、Front Door 経由の delivery へ安全に移行できない

## Users and Scenarios

- エンドユーザーは `Arcade` へ Front Door の公開 host でアクセスし、`/health`、`/login`、`/auth/start` を含む通常フローがその host で動くことを期待する
- リリース担当者は GitHub release 後の smoke test と運用 runbook が Front Door endpoint を基準に動くことを期待する
- 運用者は origin を public Internet に直接晒さず、Front Door からの private connectivity で公開入口を集約したい

## Scope

- `infra/main.bicep` に `Azure Front Door Premium` profile、endpoint、origin group、origin、route を追加する
- `Container Apps` managed environment を Front Door private connectivity 前提の公開設定へ更新する
- release workflow と verification scripts を Front Door endpoint ベースへ更新する
- Front Door 導入後の prerequisite / operations docs を更新する
- runtime config の `PUBLIC_APP_URL` と Entra callback host の follow-up が Front Door host 基準で workflow / docs に反映されるようにする

## Non-Goals

- App route や gameplay behavior の変更
- custom domain の DNS zone や certificate issuance の完全自動化
- Microsoft Entra app registration の control-plane 変更そのもの
- production や shared environment への local agent からの直接 deploy

## User-Visible Behavior

- 公開 URL は `Container App` の既定 FQDN ではなく `Azure Front Door` endpoint host を基準に扱う
- release 後の smoke test は Front Door 経由で `/health`、`/login`、`/auth/start` を確認する
- Front Door private link や route の変更を含む release でも、smoke test は edge propagation が収束するまで false negative で即 fail しない
- Front Door は `Container App` を origin とし、dynamic route は pass-through、静的 asset path のみ edge cache 対象にできる構成を持つ
- `Container Apps` managed environment は public Internet 直結ではなく Front Door private connectivity を前提に運用される
- runbook と prerequisite docs は `PUBLIC_APP_URL`、Front Door private link approval、Entra redirect URI follow-up を現行 contract として説明する

## Acceptance Criteria

- `infra/main.bicep` が `Premium_AzureFrontDoor` profile と endpoint を作成する
- `infra/main.bicep` が `Container App` origin に対する Front Door route を作成し、origin private connectivity 用の設定を含む
- `infra/main.bicep` が Front Door endpoint host を output する
- release workflow が deploy 後の smoke test target として Front Door endpoint host を使う
- release workflow の smoke test は Front Door infra change 後でも propagation delay を吸収できる retry budget を持つ
- `scripts/azure/verify-production-runtime.sh` が Front Door endpoint を解決し、Front Door private connectivity 前提の runtime contract を検証できる
- `docs/azure-prerequisites.md` と `docs/production-operations.md` が Front Door host を `PUBLIC_APP_URL` と smoke target の基準として説明する
- docs が Front Door への host 切替に合わせて Entra redirect URI と workflow-driven runtime config sync の follow-up を明示する

## Edge Cases

- Front Door default domain は custom domain 未設定でも smoke target として使える
- dynamic authenticated route は cache bypass し、静的 asset path のみ cache を有効化できる必要がある
- Front Door private connectivity は one-time approval が必要になる場合があるため、repository contract はその確認手順を runbook に残す
- Front Door private link approval や route update の直後は edge health が数分遅れて安定する場合がある
- `PUBLIC_APP_URL` と Entra callback host が旧 Container App FQDN のままだと login flow が失敗する

## Constraints and Dependencies

- `Arcade` は認証付きの dynamic web app なので、全面 CDN cache ではなく Front Door reverse proxy + selective asset cache を採用する
- deploy path は GitHub Workflow を使い、local session から production を直接更新しない
- `Azure Front Door Premium` は Standard tier と異なり private link origin をサポートする
- Front Door host への切替後は workflow-driven runtime config sync が `PUBLIC_APP_URL` を合わせ、必要なら Entra app registration の redirect URI を運用側で合わせる必要がある

## Links

- Related: [./platform-delivery-specs.md](./platform-delivery-specs.md)
- Related: [../azure-prerequisites.md](../azure-prerequisites.md)
- Related: [../production-operations.md](../production-operations.md)
