# Production Recovery And Redeploy

## Summary

Azure 上で公開中の `Arcade` が利用できない状態を解消し、原因を潰したうえで再デプロイして、公開 URL から再び正常に遊べる状態へ戻す。

## User Problem

- 現在デプロイされている app が動いておらず、公開 URL から game を利用できない
- この状態のまま再デプロイしても、root cause が残っていると同じ障害が再発する
- production recovery の進行と確認結果が作業中に追えない

## Users and Scenarios

- 運用者は production の公開 URL がなぜ動かないのかを把握したい
- 運用者は root cause を修正してから、安全に再デプロイしたい
- 利用者は redeploy 後に home、gameplay、rankings などの主要画面を再び正常に利用したい

## Scope

- 現在 Azure に出ている `Arcade` の symptom、revision、runtime logs、deployment state を確認する
- 障害の root cause を code、config、infra、runtime 設定のいずれかで特定し、必要な修正を行う
- 今回の SQL network drift のような production data path 断絶を再度見逃さないための verification を repository に追加する
- 修正後に production へ再デプロイし、health と smoke test で復旧を確認する
- 必要であれば運用ドキュメントを現在の recovery 手順に合わせて更新する

## Non-Goals

- 今回の障害対応と無関係な UI refresh や game rules の変更
- 新しい Azure platform への移行
- 長期的な observability 強化の全面実装

## User-Visible Behavior

- 公開 URL にアクセスすると app shell と主要画面が表示される
- `/health` が success を返す
- gameplay 開始、result 表示、rankings 参照など主要導線が smoke test で確認できる
- 障害原因が再デプロイ後も残らないよう、必要な修正が反映される

## Acceptance Criteria

- production app の failure symptom と root cause が作業記録から追える
- root cause に対応する修正が repository へ反映されている
- production SQL server の network policy drift を検知できる verification が repository に追加されている
- redeploy 後の production `/health` が success を返す
- redeploy 後の smoke test が成功する
- 必要な運用ドキュメント更新が repository に反映されている

## Edge Cases

- code 変更なしで rollback または configuration 修正だけで復旧できる場合でも、その理由を記録する
- 失敗が Azure runtime 側ではなく dependency や secret/config drift にある場合でも、再デプロイ前に解消する
- 最新 revision が ready でも app が正常動作しない場合は、health と主要導線の実確認を優先する

## Constraints and Dependencies

- production 確認は Azure 上の実リソースに対して行う
- recovery は既存の Container App delivery path と整合した方法で行う
- 現行 IaC は Azure SQL public endpoint を前提としているため、private networking への全面移行は今回の recovery スコープ外とする
- `/docs/plans/plan.md` を execution tracker として使い、完了後は archive する

## Links

- Related: [product-requirements.md](./product-requirements.md)
- Related: [../production-operations.md](../production-operations.md)
