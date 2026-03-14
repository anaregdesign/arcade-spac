# Repository Governance

## Spec Document Ideal State Only

## Summary

`docs/spec/` 配下の specification は、変更履歴や temporary execution state を含めず、常に現在の理想状態だけを記述する。

## User Problem

- 一部の spec に temporary execution artifact への link や一時的な delivery state への言及が残っている
- 一部の spec が work-log 前提の文言を含み、理想状態の requirement と process 情報が混在している
- spec ごとに記述粒度が揃っていないため、どこまでが durable requirement でどこからが一時的な作業情報かを判断しにくい

## Users and Scenarios

- 開発者は `docs/spec/` を開いたとき、実装時点の作業ログではなく current requirement だけを読みたい
- レビュアーは spec を見れば target behavior と acceptance criteria だけを判断できる状態を必要とする
- 次の担当者は一時的な execution record を別途参照しなくても、spec 本文から current ideal state を誤解なく追いたい

## Scope

- `docs/spec/` 配下の既存 spec から temporary execution artifact への link と一時的な delivery state の言及を取り除く
- work-log 的な process 文言を current ideal state の requirement へ書き換える
- Related doc への link は残しつつ、spec 本文は durable requirement だけを表す形に揃える
- game-specific spec を除く non-game spec は、document intent ごとの category にまとめ、原則として 1 category あたり 1 file へ統合する
- game-specific spec 以外で新しい requirement が必要になった場合も、まず既存の consolidated spec file へ吸収し、standalone non-game spec file は特別な理由がある場合だけ追加する
- `screen-flow.md` は cross-cutting な flow companion として独立を維持してよい

## Non-Goals

- historical delivery record 自体の削除や書き換え
- product behavior や Azure / auth / UI requirement そのものの変更
- `docs/spec/` 以外の documentation structure の全面再編

## User-Visible Behavior

- `docs/spec/` の各 specification は、change history や temporary execution state を含まず、current ideal state だけを記述する
- spec の Links section は temporary execution artifact ではなく、関連する durable document への参照だけを持つ
- spec の Acceptance Criteria と Constraints は、作業中の process ではなく完成後に成立しているべき条件を表す
- `docs/spec/games/` は game-specific spec の置き場として維持し、それ以外の spec は category ごとの consolidated file、または独立を維持する `screen-flow.md` から辿れる
- non-game requirement の追加時は、既存の category file に section を足して吸収するのが default であり、routine に spec file 数を増やさない

## Acceptance Criteria

- `docs/spec/` 配下の spec に temporary execution artifact への link が残らない
- `docs/spec/` 配下の spec に一時的な execution state を requirement として書いた文言が残らない
- `docs/spec/` 配下の spec に work-log 前提の durable でない記述が残らない
- spec の本文だけを読めば、各 document の target behavior と acceptance criteria を current ideal state として解釈できる
- non-game spec は category ごとに consolidated file へ整理され、例外として `screen-flow.md` だけが独立 spec として残る
- game-specific spec を除き、special reason がない限り non-game spec file が増えない

## Edge Cases

- Related document への link は、durable requirement の理解に必要な範囲で残してよい
- current problem を説明するための現状記述は残してよいが、implementation history と混在させない
- runbook や operations doc への参照は残してよいが、spec 自体を temporary delivery note の置き場にしない

## Constraints and Dependencies

- `docs/spec/` の document structure は `spec-driven-workflow` の guidance に従う
- execution sequencing や completed work の record は git と `docs/plans/` に残し、`docs/spec/` には残さない
- spec 間の cross-link は切らさず、current ideal state を読む導線は維持する
- game-specific specification を除く新規 requirement は、まず既存の consolidated spec file へ merge する

## Links

- Related: [#game-spec-document-organization](#game-spec-document-organization)
- Guidance: [../../.github/skills/spec-driven-workflow/references/spec-documentation.md](../../.github/skills/spec-driven-workflow/references/spec-documentation.md)

## Game Spec Document Organization

### Summary

`docs/spec/games/` 配下に個別ゲーム仕様を、ゲームごとに独立したファイルとして整理する。cross-game の要求は共通仕様に残し、各ゲームのルール、結果指標、ランキング対象条件はそのゲーム専用の spec から辿れる状態にする。

### User Problem

- `product-specs.md` に個別ゲームの結果指標や代表記録が混在しており、ある 1 本のゲーム仕様だけを追いたいときに参照先が分散している
- `Minesweeper` と `Sudoku` の専用 spec がなく、phase 1 lineup の全ゲームで documentation の粒度が揃っていない
- 新しいゲームを追加するときに、shared spec と game-specific spec の責務境界が曖昧になりやすい

### Users and Scenarios

- 企画者は、ある 1 本のゲームの user-visible rule、結果表示、ランキング対象条件だけを素早く確認したい
- 実装者は、shared requirement を壊さずに 1 本のゲーム仕様だけを更新したい
- レビュアーは、phase 1 lineup の全ゲームが同じ粒度で整理されていることを確認したい

### Scope

- phase 1 lineup の 6 ゲームすべてについて、`docs/spec/games/` に専用の game spec を揃える
- shared spec から個別ゲーム固有の結果指標一覧や representative metric 例を引き上げ、個別 game spec への参照へ置き換える
- `product-specs.md#arcade-app-requirements` を cross-game requirement の source of truth として残し、game-specific behavior は各 game spec へ委譲する

### Non-Goals

- 実際の gameplay rule、score formula、ranking logic を変更すること
- phase 1 lineup の構成を変えること
- `screen-flow.md` や catalog backlog を個別ゲーム専用資料に分解すること

### User-Visible Behavior

- `docs/spec/games/` を開くと、phase 1 lineup の各ゲームについて 1 ファイルずつ専用 spec を辿れる
- shared spec は cross-game rule と導線定義に集中し、個別ゲームの代表記録や support metric 一覧を長く内包しない
- 個別ゲームの primary metric、support metric、失敗時の扱い、ランキング対象条件は、そのゲーム専用 spec にまとまっている
- game-specific spec は、non-game spec file 数を増やさない repository policy の明示的な例外として扱われる

### Acceptance Criteria

- `Minesweeper`、`Sudoku`、`Drop Line`、`Color Sweep`、`Number Chain`、`Pair Flip` の 6 ゲームそれぞれに専用 spec file が存在する
- `product-specs.md#arcade-app-requirements` は個別ゲームの記録一覧や representative metric 例を直書きせず、各 game spec を参照する
- phase 1 lineup の個別ゲーム仕様を辿るのに、shared spec と game spec の責務が混線しない

### Edge Cases

- 将来 7 本目以降のゲームを追加するときも、同じ単位で 1 game 1 file を追加すればよい構成になっている
- shared result layout や ranking rule が変わっても、game-specific delta だけ各 game spec に追記できる

### Constraints and Dependencies

- phase 1 lineup と既存の file naming pattern を維持する
- shared doc の cross-links は切らさない

### Links

- Requirements: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Flow: [screen-flow.md](./screen-flow.md)

## Agent Skill Bootstrap

### Summary

Repository-scoped Copilot agent skills are vendored under `.github/skills/` so the workspace carries its own planning, application architecture, Azure delivery, auth, and Copilot cloud-access guidance without depending on an external checkout. The repository inventory and instructions describe only the currently supported local skills.

### User Problem

- The repository needs local copies of the current Copilot skill set so instructions resolve inside the workspace.
- The skill directories must stay in a specific layout because sibling skills may use relative links to shared references.
- The repository-level Copilot instructions and specs need to describe only the supported local skill inventory.
- Contributors need one current description of which skills are available and how they are combined by concern.

### Users and Scenarios

- A maintainer wants this repository to vendor the current five local skills directly under `.github/skills/` so future Copilot sessions can use them locally.
- A contributor wants `.github/copilot-instructions.md` and `AGENTS.md` to clearly route non-trivial work through the spec-first workflow before architecture, Azure delivery, auth, or Copilot cloud-access guidance are added.
- A contributor working on Azure delivery wants to know that `azure-app-platform-delivery` is the repository's default Azure extension for this repository.

### Scope

- Keep the current local skill inventory synchronized under `.github/skills/`: `react-router-prisma-app-architecture`, `azure-app-platform-delivery`, `entra-user-auth-registration`, `copilot-azure-cloud-access`, and `spec-driven-workflow`.
- Preserve sibling relative references between skill directories after generation or synchronization.
- Keep `.github/copilot-instructions.md`, `AGENTS.md`, and this spec aligned on skill roles, preferred invocation order, and spec workflow expectations for this repository.
- Remove stale references to retired local skills from repository docs.

### Non-Goals

- Changing application runtime behavior.
- Choosing between overlapping Azure skills dynamically beyond documenting the repository default.
- Introducing new repository workflows outside the supported skill inventory and instruction alignment updates.

### User-Visible Behavior

- The repository contains `.github/skills/react-router-prisma-app-architecture/`, `.github/skills/azure-app-platform-delivery/`, `.github/skills/entra-user-auth-registration/`, `.github/skills/copilot-azure-cloud-access/`, and `.github/skills/spec-driven-workflow/` with the expected local contents available in-workspace.
- Relative references between sibling skills continue to resolve after the sync.
- `.github/copilot-instructions.md` and `AGENTS.md` tell Copilot to start non-trivial application-development work with `spec-driven-workflow`, then add `react-router-prisma-app-architecture` for app-code architecture guidance, and then add the Azure, Entra, and Copilot cloud-access skills only for the task categories that require them.
- The repository instructions treat `azure-app-platform-delivery` as the Azure extension for default task routing in this repository.
- Repository docs describe only the supported local skill inventory.

### Acceptance Criteria

- The five current skill directories exist under `.github/skills/`.
- The vendored skill directories preserve any required sibling-relative references.
- `.github/copilot-instructions.md`, `AGENTS.md`, and this spec agree on `spec-driven-workflow` first for non-trivial work and on the default companion-skill order that follows it.
- Repository docs and specs do not describe or list retired local skills.
- Repository instructions and specs consistently describe the default routing expectations captured in this document.

### Edge Cases

- If destination skill directories already exist, they are replaced or synchronized to the upstream repository version instead of merged manually.
- If one source skill contains directories not present in another, the sync preserves only what exists in the corresponding upstream source directory.
- If any repository doc still reflects an older inventory, it is rewritten to the currently supported set.

### Constraints and Dependencies

- The default invocation order for non-trivial repository work starts with `spec-driven-workflow`, then adds `react-router-prisma-app-architecture`, then `azure-app-platform-delivery` when Azure delivery work applies, then `entra-user-auth-registration`, then `copilot-azure-cloud-access` for the matching deltas.
- Repository instructions and specs must stay aligned on supported skill inventory and invocation order.
- The vendored skill directories under `.github/skills/` must remain stable enough that sibling relative links continue to resolve.

### Links

- Related: [../../.github/copilot-instructions.md](../../.github/copilot-instructions.md)
- Related: [../../AGENTS.md](../../AGENTS.md)

## Unit Test Coverage Scope

### Summary

`unit test coverage` は repository 全体へ機械的に 100% を要求するのではなく、pure で deterministic な module scope に対して 100% を要求し、route / component / browser / persistence flow は higher-level verification で担保する。

### User Problem

- blanket な repository-wide 100% coverage target は、value の低い mock-heavy test を増やしやすく、保守性を下げる
- route、browser side effect、React component、Playwright 向きの flow まで unit test に押し込むと、test owner が曖昧になりやすい
- coverage gate の scope が曖昧だと、どの層を unit test で守るべきか判断しづらい

### Users and Scenarios

- 開発者は pure な domain / usecase helper を unit test で素早く守りたい
- 開発者は component や route flow を brittle な unit test で無理に 100% 化するのではなく、適切な higher-level test へ回したい
- レビュアーは coverage report を見て、何が unit scope で、何が integration / UI verification owner かを判断したい

### Scope

- deterministic な domain utility、formatting helper、selector、view-model mapper を unit coverage scope として定義する
- unit coverage scope に対しては 100% coverage gate を要求する
- route module、component rendering、browser API 連携、network / persistence orchestration は unit coverage scope から外し、別 verification owner として扱う

### Non-Goals

- repository 全体に blanket な 100% coverage を要求すること
- Playwright や route-level verification を unit test で置き換えること
- persistence / browser side effect を heavy mock 前提の unit test へ無理に押し込むこと

### User-Visible Behavior

- pure で deterministic な unit scope は、常に 100% coverage gate を満たした状態で維持される
- component、route、browser side effect、server orchestration の品質は、それぞれに合った verification 方法で確認される
- coverage report を見ると、unit scope の owner が明確で、coverage 数値の意味を誤解しにくい

### Acceptance Criteria

- repository に unit test runner と coverage config があり、unit scope を明示して実行できる
- configured unit scope は 100% statement / branch / function / line coverage を要求する
- coverage config は deterministic module を対象にし、route / component / browser / persistence flow を blanket に含めない
- unit coverage gate を通すために value の低い snapshot-heavy test や integration-mock test を追加しない

### Edge Cases

- `use` prefix を持つ pure view-model helper でも React runtime に依存しないなら unit scope に含めてよい
- browser / React Router hook を直接使う module は deterministic helper を分離できるなら分離した helper だけを unit scope に含める
- 新しい deterministic helper を追加した場合は、同じ unit scope に取り込んで coverage gate を維持する

### Constraints and Dependencies

- unit coverage gate は repository-wide 100% target ではなく deterministic unit scope の 100% target として扱う
- UI-affecting flow と route flow は、引き続き architecture skill が要求する higher-level verification と併用する
- test tooling は current TypeScript / Vite repository と整合する必要がある

### Links

- Related: [../../.github/skills/react-router-prisma-app-architecture/references/verification-gates.md](../../.github/skills/react-router-prisma-app-architecture/references/verification-gates.md)
- Related: [../../.github/skills/react-router-prisma-app-architecture/references/view-state-and-handler-patterns.md](../../.github/skills/react-router-prisma-app-architecture/references/view-state-and-handler-patterns.md)

## Component TSX File Naming

### Summary

route module と framework entrypoint の例外を除き、component-oriented な `.tsx` file は `UpperCamel` file name に統一する。

### User Problem

- component file が `kebab-case` と `UpperCamel` で混在すると、React component file と route module の naming rule が曖昧になる
- export 名と file 名がずれると、component import をたどるときに search と rename がやりづらい
- route 由来の lowercase naming を component directory に持ち込むと、framework convention と component convention の境界が崩れる

### Users and Scenarios

- 開発者は `app/components/` 配下の `.tsx` を見たとき、file 名だけで React component file だと判別したい
- 開発者は export component 名と file 名が一致した状態で rename と import update を行いたい
- レビュアーは route module の FlatRoute naming と component file の naming が混線していないことを確認したい

### Scope

- `app/components/` 配下の component-oriented `.tsx` file を `UpperCamel` file name に統一する
- rename 後の import path を repository 全体で整合させる
- route module と framework entrypoint の lowercase naming は例外として明示する

### Non-Goals

- React Router FlatRoute file naming の変更
- `app/root.tsx` や framework-owned entry file の rename
- `.ts` module や CSS Module file の naming policy 変更

### User-Visible Behavior

- 画面表示、route path、loader / action wiring、component behavior は rename 前後で変わらない
- `app/components/` 配下の `.tsx` file は `UpperCamel` に揃い、component export 名と file 名が対応する
- `app/routes/` 配下の `.tsx` file は FlatRoute naming を維持し、framework convention を壊さない

### Acceptance Criteria

- route module と framework entrypoint を除く `app/components/` 配下の `.tsx` file に lowercase / kebab-case file name が残らない
- rename 対象 component の import path は全て更新される
- `app/routes/` 配下の file naming は existing FlatRoute convention のまま維持される
- build と typecheck が通る

### Edge Cases

- shared component でも `app/components/` 配下なら `UpperCamel` file name を使う
- component file が game-specific directory の下にあっても、route module でない限り `UpperCamel` を使う
- CSS Module file や `game-workspace-types.ts` のような non-TSX file はこの rule の対象外とする

### Constraints and Dependencies

- React Router route module は framework convention を優先し、FlatRoute naming を維持する
- `app/root.tsx` は framework entrypoint として existing naming を維持する
- component file rename は import path の整合を同じ change set で完結させる

### Links

- Related: [../../.github/skills/react-router-prisma-app-architecture/references/layout-and-module-placement.md](../../.github/skills/react-router-prisma-app-architecture/references/layout-and-module-placement.md)

## Repository Rename And Integration Retargeting

### Summary

誤った repository name を正しい canonical name `anaregdesign/arcade-spec` に統一し、Git remote、GitHub Actions、GitHub Packages、Azure deployment integration、運用ドキュメントを順番に追従させる。rename 後も release build、container publish、Azure deploy、運用手順が新しい repository identity を前提に破綻しない状態へ揃える。

### User Problem

- local workspace directory は `arcade-spec` だが、rename 前は origin remote と GitHub repository slug が canonical name と不一致だった
- GitHub repository identity が曖昧なままだと、GHCR image path、OIDC subject、GitHub Environment 運用、release automation、Azure Container Apps deploy の前提がずれる
- ドキュメントと運用コマンドが誤った repository identity を前提に残ると、rename 後の保守で事故が起きやすい

### Users And Scenarios

- 開発者は、正しい repository name へ remote と local convention を統一したい
- リリース担当者は、GitHub Releases から GHCR publish と Azure deploy を継続したい
- 運用担当者は、rename 後も smoke test、rollback、production operations の手順を新しい repository identity で辿りたい

### Scope

- 正しい target repository name `anaregdesign/arcade-spec` を確定し、workspace 内の repository-facing references を洗い出す
- Git remote、repository documentation、GitHub workflow references、container image naming assumptions、Azure deploy integration assumptions を新しい repository identity に揃える
- rename 後に必要な GitHub 側と Azure 側の follow-up task を明文化し、実行可能な remediation を先に適用する

### Non-Goals

- アプリの user-facing gameplay や product behavior を変更すること
- Azure resource group や app name を根拠なく rename すること
- 実在しない GitHub repository や Azure resource へ強制的に切り替えること

### User-Visible Behavior

- repository docs には正しい canonical repository name と follow-up handoff が記載される
- CI/CD の repository-bound references は rename 後の GitHub repository identity を前提に揃う
- Azure workload identity の hard reference も rename 後の repository slug に揃う
- repository docs と runbook には rename と follow-up の順序が記載される

### Acceptance Criteria

- 正しい target repository name `anaregdesign/arcade-spec` が repository docs で明示される
- workspace 内の repository-bound references が target name に合わせて整理される
- GitHub Actions と Azure deploy integration について、rename 後に必要な設定変更点と監査結果が docs に残る
- GitHub `production` Environment、recent release workflow、main branch protection、live Container App image path の確認結果が runbook に残る
- Azure deploy 用 federated credential subject が `repo:anaregdesign/arcade-spec:environment:production` に更新される
- repository docs と runbook が rename 後の follow-up sequence を説明している

### Edge Cases

- local workspace folder name と remote repository slug が同時に違っている場合でも、canonical name を 1 つに定めて移行順序を保てる
- GitHub repository rename では自動 redirect が効いても、OIDC subject や package namespace のような hard reference は別途更新が必要になる
- Azure 側の federated credential subject や environment-scoped variables は code change だけでは完了しないため、手動 follow-up を残す

### Constraints And Dependencies

- target repository name は `anaregdesign/arcade-spec` とする
- Azure deploy integration は GitHub repository slug に依存する設定がありうるため、canonical name に沿った follow-up を明示する必要がある
- GitHub Environment variables や branch protection のような repo-hosted state は code review だけでは保証できないため、実測結果を runbook に残す必要がある
- branch protection policy の具体値は運用判断を伴うため、未設定の確認と要件整理を先行し、機械的な強制設定は行わない

### Links

- Follow-up: [../repository-rename-runbook.md](../repository-rename-runbook.md)
- Workflow: [../../.github/workflows/release-container-image.yml](../../.github/workflows/release-container-image.yml)
- Azure config: [../../azure.yaml](../../azure.yaml)
