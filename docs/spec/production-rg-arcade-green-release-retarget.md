# Production Rg Arcade Green Release Retarget

## Summary

Operator は GitHub Actions workflow を使って、GitHub Environment には shared prefix `rg-arcade` だけを保持しつつ、workflow 側の suffix selection で `rg-arcade-green` を fresh target にした bootstrap、routine release、runtime verification を開始できる。

## User Problem

- GitHub Environment の `production` / `production-bootstrap` が workflow contract と揃っていないと、release や recovery が失敗する
- `AZURE_RESOURCE_GROUP` に full resource group name を保存すると、green / blue / dev の切り替えごとに shared GitHub Environment を書き換える必要があり、temporary experiment が production contract を汚しやすい
- Provisioning test で past resource がない前提なのに、以前の resource group や config store へ依存すると再現性が崩れる
- empty target では Azure Front Door private link approval が ARM deployment completion を block しうるため、workflow 側が approval と deployment wait を正しい順序で扱わないと bootstrap / release が deadlock する
- empty target で resource group 自体を作り直す場合、GitHub OIDC deploy identity の RG-scope role assignment も消えるため、bootstrap identity の stable-scope 権限と production release identity の RBAC restore path がないと recovery が再現できない
- App Configuration と Key Vault は soft-delete により global name が保持されるため、同じ RG への recreate でも deterministic name を固定すると deleted-state resource と衝突して bootstrap が失敗する
- local から直接 Azure へ deploy すると、この repo の運用 policy と release traceability が崩れる

## Users and Scenarios

- Operator は `rg-arcade-green` 向けに GitHub Environment を再登録し、release workflow で再配備したい
- Operator は GitHub Environment の `AZURE_RESOURCE_GROUP` を shared prefix `rg-arcade` のまま維持し、workflow 側の suffix selection だけで `green` / `blue` / `dev` target を切り替えたい
- Operator は resource group を失っても、`production-bootstrap` から bootstrap/recovery path を再実行できる状態を維持したい
- Operator は release 後に runtime verification まで同じ workflow contract で確認したい

## Scope

- `production` / `production-bootstrap` の `AZURE_RESOURCE_GROUP` を shared prefix contract に揃える
- `production` Environment の required variables と secrets を workflow contract に合わせる
- `production-bootstrap` Environment を用意し、bootstrap/recovery path に必要な variables と secrets を登録する
- `rg-arcade-green` を empty resource group 前提で bootstrap できるように fresh provisioning inputs を揃える
- `rg-arcade-green` を target に release workflow を publish し、必要な verification workflow まで実行する

## Non-Goals

- App code や gameplay behavior の変更
- local Azure CLI からの直接 deploy を正式運用に戻すこと
- Azure 側 resource naming rule の redesign

## User-Visible Behavior

- GitHub 上で `production` と `production-bootstrap` の `AZURE_RESOURCE_GROUP` は shared prefix `rg-arcade` を保持し、workflow が full resource group name を導出する
- bootstrap / release workflow は empty `rg-arcade-green` に対しても Azure Front Door private link approval を処理し、その後 deployment completion まで進む
- bootstrap workflow は `green` / `blue` / `dev` suffix を workflow input で受け取り、shared prefix と合成して target resource group を決定できる
- release / verification workflow は shared prefix と workflow-managed production suffix `green` から `rg-arcade-green` を決定する
- bootstrap workflow は recreated `rg-arcade-green` 上で `production` release identity に必要な Azure role assignment を復元し、その後の runtime config sync と app deploy が継続できる
- operator は global-name resource の recreate が必要なときだけ `production` / `production-bootstrap` の共通 suffix を更新し、App Configuration と Key Vault の name collision を回避できる
- release publish 後、workflow は `rg-arcade-green` を target に infra plan、runtime config sync、app deploy、smoke test を進める
- 必要時には bootstrap/recovery workflow も同じ empty target に対して起動できる

## Acceptance Criteria

- `production` Environment に release workflow が要求する variables と secrets が存在する
- `production-bootstrap` Environment に bootstrap workflow が要求する variables と secrets が存在する
- `production` / `production-bootstrap` の `AZURE_RESOURCE_GROUP` には shared prefix `rg-arcade` だけが保存されている
- workflow-managed suffix selection により target resource group は `rg-arcade-green` に揃っている
- 以前の resource group や live secret を参照しなくても、fresh provisioning input だけで bootstrap と release を開始できる
- empty target の bootstrap / release workflow は Azure Front Door private link approval で deadlock せず、approval 後に deployment completion を待って次の job へ進む
- empty target の bootstrap workflow は `production-bootstrap` identity の stable-scope 権限で resource group を再作成し、recreated RG 上の `production` release RBAC を復元できる
- soft-deleted App Configuration / Key Vault が残っていても、operator-managed suffix を回すことで同じ RG target に新しい global resource name で bootstrap / release を継続できる
- release publish 後、対象 workflow が GitHub Actions 上で成功し、失敗した場合は失敗点が特定できる

## Edge Cases

- `production-bootstrap` Environment が未作成でも、release 前に作成して bootstrap path を復旧できる
- empty target では既存 Azure resource から secret を逆引きしない。必要な secret は fresh value か repo 外の source of truth から登録する
- `PUBLIC_APP_URL` を固定しない場合でも、workflow が Front Door host を導出できる
- blue / dev の bootstrap experiment では `AZURE_RESOURCE_GROUP` prefix を変えずに suffix input だけを切り替える
- `rg-arcade-spec-dev` のような既存 resource group が残っていても、Provisioning test の target としては使わない
