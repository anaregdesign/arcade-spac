# External Organizations Sign-In

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

- Related: [product-requirements.md](./product-requirements.md)
- Related: [../azure-prerequisites.md](../azure-prerequisites.md)
- Related: [../production-operations.md](../production-operations.md)
