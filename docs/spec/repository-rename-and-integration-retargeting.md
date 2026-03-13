# Repository Rename And Integration Retargeting

## Summary

誤った repository name を正しい canonical name `anaregdesign/arcade-spec` に統一し、Git remote、GitHub Actions、GitHub Packages、Azure deployment integration、運用ドキュメントを順番に追従させる。rename 後も release build、container publish、Azure deploy、運用手順が新しい repository identity を前提に破綻しない状態へ揃える。

## User Problem

- local workspace directory は `arcade-spec` だが、rename 前は origin remote と GitHub repository が `arcade-spac` で不一致だった
- GitHub repository identity が曖昧なままだと、GHCR image path、OIDC subject、GitHub Environment 運用、release automation、Azure Container Apps deploy の前提がずれる
- ドキュメントと運用コマンドが誤った repository identity を前提に残ると、rename 後の保守で事故が起きやすい

## Users And Scenarios

- 開発者は、正しい repository name へ remote と local convention を統一したい
- リリース担当者は、GitHub Releases から GHCR publish と Azure deploy を継続したい
- 運用担当者は、rename 後も smoke test、rollback、production operations の手順を新しい repository identity で辿りたい

## Scope

- 正しい target repository name `anaregdesign/arcade-spec` を確定し、workspace 内の repository-facing references を洗い出す
- Git remote、repository documentation、GitHub workflow references、container image naming assumptions、Azure deploy integration assumptions を順番に修正し、rename 完了後の残課題を整理する
- rename 後に必要な GitHub 側と Azure 側の follow-up task を明文化し、実行可能な remediation を先に適用する

## Non-Goals

- アプリの user-facing gameplay や product behavior を変更すること
- Azure resource group や app name を根拠なく rename すること
- 実在しない GitHub repository や Azure resource へ強制的に切り替えること

## User-Visible Behavior

- repository docs には正しい canonical repository name と follow-up handoff が記載される
- CI/CD の repository-bound references は rename 後の GitHub repository identity を前提に揃う
- Azure workload identity の hard reference も rename 後の repository slug に揃う
- rename 作業の順序が plan と archived plan に残り、途中で止まっても次の担当者が再開できる

## Acceptance Criteria

- 正しい target repository name `anaregdesign/arcade-spec` が spec と plan で明示される
- workspace 内の repository-bound references が target name に合わせて整理される
- GitHub Actions と Azure deploy integration について、rename 後に必要な設定変更点と監査結果が docs に残る
- GitHub `production` Environment、recent release workflow、main branch protection、live Container App image path の確認結果が runbook に残る
- Azure deploy 用 federated credential subject が `repo:anaregdesign/arcade-spec:environment:production` に更新される
- rename 作業の execution plan が `/docs/plans/plan.md` で追跡され、完了時に archive される

## Edge Cases

- local workspace folder name と remote repository slug が同時に違っている場合でも、canonical name を 1 つに定めて移行順序を保てる
- GitHub repository rename では自動 redirect が効いても、OIDC subject や package namespace のような hard reference は別途更新が必要になる
- Azure 側の federated credential subject や environment-scoped variables は code change だけでは完了しないため、手動 follow-up を残す

## Constraints And Dependencies

- target repository name は `anaregdesign/arcade-spec` とする
- GitHub 側の repository rename は完了したが、post-rename verification と外部 follow-up が残る
- Azure deploy integration は GitHub repository slug に依存する設定がありうるため、rename 後の follow-up を明示する必要がある
- GitHub Environment variables や branch protection のような repo-hosted state は code review だけでは保証できないため、実測結果を runbook に残す必要がある
- branch protection policy の具体値は運用判断を伴うため、未設定の確認と要件整理を先行し、機械的な強制設定は行わない

## Links

- Plan Archive: [../plans/plan.20260313-212133.md](../plans/plan.20260313-212133.md)
- Follow-up: [../repository-rename-runbook.md](../repository-rename-runbook.md)
- Workflow: [../../.github/workflows/release-container-image.yml](../../.github/workflows/release-container-image.yml)
- Azure config: [../../azure.yaml](../../azure.yaml)