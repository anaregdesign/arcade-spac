# Component View Layer Refactor

## Summary

`Arcade` の主要 screen と game workspace は、見え方と操作結果を維持したまま `components` を View-only に整理し、interaction logic・derived view model・browser side effect を `app/lib` 側へ移す。

## User Problem

- refactor 前の `components` には screen ごとの state、event handler、result submit、sound trigger、browser side effect が混在している
- View と interaction logic が同じ file にあると、game ごとの UI 変更や bug fix で影響範囲が読みにくい
- 同じ挙動の修正でも screen ごとに logic が散り、見た目の維持と内部変更の切り分けが難しい

## Users and Scenarios

- プレイヤーは Home、Profile、Rankings、Result、各 game screen を今までどおり同じ見え方と操作感で使いたい
- プレイヤーは game run 完了時に、従来どおり自動で Result へ遷移したい
- 開発者は UI を調整するとき、`components` を View として扱い、screen logic は `app/lib/client/usecase` から追える状態にしたい

## Scope

- `components` 内の non-trivial logic を `app/lib/client/usecase` 配下へ移す
- shared shell / dialog / screen-level view model を canonical layout に沿って整理する
- 各 game workspace component から run state 連携、sound trigger、result submit、derived status copy を `app/lib` へ移す
- refactor 後も user-facing behavior が変わらないことを verification する

## Non-Goals

- Home、Profile、Rankings、Result、game workspace の visual redesign
- game rule、score 計算、ranking 保存仕様の変更
- route/action/loader の HTTP contract 変更

## User-Visible Behavior

- Home の search、filter、sort、show more、game preview、play 導線は従来どおり動作する
- App shell の menu、help dialog、sound mute、navigation は従来どおり使える
- Profile の theme preview、profile edit form、trend 表示、game 別 performance 表示は従来どおり維持される
- Rankings、Result、Login の copy・導線・状態表示は従来どおり維持される
- 各 game workspace では start overlay、difficulty 切り替え、play 中の status、sound feedback、clear/fail 後の自動 Result 遷移が従来どおり動作する

## Acceptance Criteria

- `app/components/` から non-trivial state transition、derived view-model helper、browser side effect、result submit orchestration が外れている
- `app/lib/client/usecase/` に screen / workspace ごとの public entry が追加され、component は View rendering に集中している
- Home、Profile、Rankings、Result、Login、App shell、game instructions dialog の表示・操作結果に regression がない
- 7 game workspace の run 開始、play 中、clear / fail、Result 遷移の挙動が変わらない
- typecheck と lint が通る

## Edge Cases

- Home の URL query / local storage restore と scroll restore が refactor 後も壊れない
- Profile の theme preview は form 保存前でも即時反映され、screen を離れたとき不要な body state を残さない
- shared result / pending result / direct game route から開いた screen でも app shell と Result の導線が崩れない
- touch 前提の game でも Flag mode や tap feedback が従来どおり機能する

## Constraints and Dependencies

- canonical layout は `react-router-prisma-app-architecture` skill の `app/lib/client/usecase/<feature>/` を基準にする
- `components` は View rendering を責務にし、logic は `app/lib` で ownership を持つ
- user-facing copy や route path を変えずに内部 refactor として完了させる

## Links

- Execution record: [../plans/plan.20260314-125519.md](../plans/plan.20260314-125519.md)
- Related: [ui-specs.md](./ui-specs.md)
- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
