# README Azure Prereq Summary

## Summary

Developer 向けの `README.md` に、GitHub Workflow 実行前に必要な Azure / GitHub side の準備だけを簡潔にまとめる。

## User Problem

- current `README.md` の Azure prerequisite section が広すぎて、workflow 実行前に人が何を準備すればよいかがすぐ読めない
- detailed runbook 相当の情報まで README に入っていて、developer onboarding 用としては冗長
- current repository contract では OIDC identity、GitHub Environment、app sign-in 用 Entra registration が別の責務だが、その切り分けが README では十分に簡潔ではない

## Users and Scenarios

- developer は別 resource group への bootstrap や redeploy 前に、GitHub Workflow 実行前の最低限の準備を README だけで確認したい
- maintainer は README には短い checklist だけ残し、詳細は `docs/azure-prerequisites.md` と `docs/production-operations.md` に逃がしたい

## Scope

- `README.md` の Azure prerequisite guidance を developer 向けに簡潔化する
- workflow 実行前の作業を `GitHub Actions OIDC identity`、`GitHub Environments`、`app sign-in 用 Entra registration` の単位で整理する
- GitHub Environment values は箇条書きではなく table で整理し、各 value の意味と取得元を短く示す
- detailed operational notes や Azure topology の重複説明は README から削るか圧縮する
- 詳細 docs へのリンクは維持する

## Non-Goals

- Azure topology や workflow behavior の変更
- detailed recovery runbook の削除
- app runtime contract 自体の変更

## User-Visible Behavior

- README を読むだけで、workflow 実行前の必要作業が数項目で把握できる
- README は developer 向けの short checklist に留まり、詳細確認が必要な場合だけ docs を開けばよい
- `Service Principal` 作成だけでは不足で、OIDC federated credential、RBAC、GitHub Environment 設定、app sign-in 用 Entra registration まで必要だと簡潔にわかる
- GitHub Environment section は `production` / `production-bootstrap` の table で読めて、各 variable / secret の意味と取得元が一目でわかる

## Acceptance Criteria

- `README.md` に GitHub Workflow 実行前の short checklist がある
- checklist は current repository contract と一致する
- GitHub Environment values が table で整理され、各 row に meaning と source がある
- README の Azure prerequisite section から detailed duplicate explanation が減っている
- 詳細 docs への link は残っている

## Edge Cases

- empty resource group から始める bootstrap と、既存 baseline への routine release の違いは README では一言で触れるだけに留める
- optional registry variables や detailed runtime-store values は README に列挙しない

## Constraints and Dependencies

- README は developer 向けなので、detailed runbook より short checklist を優先する
- detailed source of truth は `docs/azure-prerequisites.md` と `docs/production-operations.md` に残す
