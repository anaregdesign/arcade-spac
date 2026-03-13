# Repository Rename And Integration Retargeting

## Summary

誤った repository name を正しい canonical name `anaregdesign/arcade-spec` に統一し、Git remote、GitHub Actions、GitHub Packages、Azure deployment integration、運用ドキュメントを順番に追従させる。rename 後も release build、container publish、Azure deploy、運用手順が新しい repository identity を前提に破綻しない状態へ揃える。

## User Problem

- 現在の local workspace directory は `arcade-spec`、origin remote は `arcade-spac` で不一致があり、どちらも typo の可能性がある
- GitHub repository identity が曖昧なままだと、GHCR image path、OIDC subject、GitHub Environment 運用、release automation、Azure Container Apps deploy の前提がずれる
- ドキュメントと運用コマンドが誤った repository identity を前提に残ると、rename 後の保守で事故が起きやすい

## Users And Scenarios

- 開発者は、正しい repository name へ remote と local convention を統一したい
- リリース担当者は、GitHub Releases から GHCR publish と Azure deploy を継続したい
- 運用担当者は、rename 後も smoke test、rollback、production operations の手順を新しい repository identity で辿りたい

## Scope

- 正しい target repository name `anaregdesign/arcade-spec` を確定し、workspace 内の repository-facing references を洗い出す
- Git remote、repository documentation、GitHub workflow references、container image naming assumptions、Azure deploy integration assumptions を順番に修正する
- rename 後に必要な GitHub 側と Azure 側の follow-up task を明文化する

## Non-Goals

- アプリの user-facing gameplay や product behavior を変更すること
- Azure resource group や app name を根拠なく rename すること
- 実在しない GitHub repository や Azure resource へ強制的に切り替えること

## User-Visible Behavior

- repository docs には正しい canonical repository name と follow-up handoff が記載される
- CI/CD の repository-bound references は rename 後の GitHub repository identity を前提に揃う
- rename 作業の順序が plan と archived plan に残り、途中で止まっても次の担当者が再開できる

## Acceptance Criteria

- 正しい target repository name `anaregdesign/arcade-spec` が spec と plan で明示される
- workspace 内の repository-bound references が target name に合わせて整理される
- GitHub Actions と Azure deploy integration について、rename 後に必要な設定変更点が docs に残る
- rename 作業の execution plan が `/docs/plans/plan.md` で追跡され、完了時に archive される

## Edge Cases

- local workspace folder name と remote repository slug が同時に違っている場合でも、canonical name を 1 つに定めて移行順序を保てる
- GitHub repository rename では自動 redirect が効いても、OIDC subject や package namespace のような hard reference は別途更新が必要になる
- Azure 側の federated credential subject や environment-scoped variables は code change だけでは完了しないため、手動 follow-up を残す

## Constraints And Dependencies

- target repository name は `anaregdesign/arcade-spec` とする
- GitHub 側の repository rename 実作業は、この workspace の編集だけでは完了しない可能性がある
- Azure deploy integration は GitHub repository slug に依存する設定がありうるため、rename 後の follow-up を明示する必要がある

## Links

- Plan Archive: [../plans/plan.20260313-211626.md](../plans/plan.20260313-211626.md)
- Follow-up: [../repository-rename-runbook.md](../repository-rename-runbook.md)
- Workflow: [../../.github/workflows/release-container-image.yml](../../.github/workflows/release-container-image.yml)
- Azure config: [../../azure.yaml](../../azure.yaml)