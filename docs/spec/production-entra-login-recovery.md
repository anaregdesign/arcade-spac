# Production Entra Login Recovery

## Summary

Hosted `Arcade` で `Microsoft Entra ID` sign-in が callback 後に失敗せず、production revision が pending Prisma migrations を確実に適用したうえで起動できる状態へ戻す。

## User Problem

- hosted login では `Microsoft Entra ID` の sign-in 画面を通過したあと `/login?error=entra_exchange_failed` に戻され、`/home` へ入れないことがある
- 現在の callback error は token exchange failure と user sync / database failure を同じ query code に潰しており、運用者が原因を切り分けにくい
- release-time migration enforcement を入れた revision でも startup migration が失敗すると、schema drift が残ったまま古い revision が traffic を取り続ける

## Users And Scenarios

- player は hosted environment で `Continue with Microsoft Entra ID` を押したあと、そのまま `/home` へ戻りたい
- operator は login callback failure が起きたとき、token exchange failure と app-side database failure を log と UI から区別したい
- releaser は new revision が serving 前に pending Prisma migrations を apply できることを期待する

## Scope

- hosted login callback の failure を token exchange と user sync / database sync で区別して log する
- login screen の error copy を production diagnosis に使える粒度へ更新する
- startup migration path が App Configuration / Key Vault secret drift に依存せず `DATABASE_URL` を確実に受け取れるようにする
- release delivery が migration-ready env を revision に渡せるようにする

## Non-Goals

- `Microsoft Entra ID` app registration audience や redirect URI policy の redesign
- production / shared environment への local direct deploy
- user-facing game UI や ranking behavior の変更

## User-Visible Behavior

- hosted `Microsoft Entra ID` sign-in が成功した場合、callback 後に `/home` へ遷移する
- token exchange failure の場合、login screen では app registration / callback contract の確認を促す
- callback 後の user sync / database failure の場合、login screen では hosted database または release schema drift の確認を促す
- operator は container logs から callback failure の種類と raw error message を確認できる

## Acceptance Criteria

- production callback logs に token exchange failure と user sync failure が別々に出る
- login route は `entra_token_exchange_failed` と `auth_user_sync_failed` を別 message にマップする
- startup migration script は dedicated env または equivalent fallback から migration 用 `DATABASE_URL` を受け取れる
- release workflow は startup migration 用 `DATABASE_URL` を revision へ渡せる
- local verification と targeted test / typecheck / build が通る

## Edge Cases

- `Microsoft Entra ID` 側の `error` query parameter は従来どおり `entra_access_denied` に落とす
- callback failure で pending auth session は clear しつつ、return path は維持する
- hosted runtime は App Configuration / Key Vault を引き続き runtime source of truth とし、startup migration 用 env は migration bootstrap 専用とする

## Constraints And Dependencies

- production release は GitHub Workflow path を使う
- hosted runtime は Azure SQL `Private Endpoint` と `DefaultAzureCredential` / Managed Identity auth を前提にする
- GitHub-hosted Actions runner は SQL Database private data plane に直接入らない前提で設計する

## Links

- Related: [./feature-specs.md#external-organizations-sign-in](/Users/hiroki/arcade-spec/docs/spec/feature-specs.md)
- Related: [./operations-specs.md](/Users/hiroki/arcade-spec/docs/spec/operations-specs.md)
- Related: [../production-operations.md](/Users/hiroki/arcade-spec/docs/production-operations.md)
