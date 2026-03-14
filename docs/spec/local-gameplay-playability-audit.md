# Local Gameplay Playability Audit

## Summary

ローカル開発環境で current catalog の全ゲームを 1 回ずつ実際にプレイし、正しく描画されない、開始できない、または通常操作で完了不能なゲームがあれば、その場で修正して再検証できる状態にする。

## User Problem

- catalog に含まれるゲーム数が増えたため、見た目だけでは正常に遊べるか判断できない
- 一部ゲームで描画崩れ、入力不能、進行不能、または結果保存まで到達できない不具合が混在している可能性がある
- 開発者は各ゲームを個別に目視確認するより、repository 側で一度横断的に監査して playability を担保したい

## Users and Scenarios

- 開発者はローカル fixture 環境で全ゲームを一巡プレイして、壊れているゲームだけをすぐ修正したい
- レビュアーは current catalog の各ゲームが少なくとも local development 上で開始、進行、完了できることを確認したい
- 今後の追加実装前に、既存ゲーム群の baseline playability を回復したい

## Scope

- current supported catalog の全ゲームを local development で 1 回ずつ起動してプレイ確認する
- 各ゲームについて、初期描画、主要入力、ゲーム進行、成功または失敗による終了までを確認する
- playability を阻害する不具合が見つかったゲームは、その場で修正して同じローカル導線で再検証する
- 必要な範囲で gameplay workspace、shared gameplay component、route wiring、または関連 helper を修正する

## Non-Goals

- ゲームルールの意図的な再設計
- ランキング、プロフィール、共有導線など今回の playability 監査に直接関係しない画面改善
- production または shared environment での動作保証

## User-Visible Behavior

- local development で home から current catalog の各ゲームへ遷移できる
- 各ゲームは主要 UI が壊れずに描画され、プレイに必要な入力を受け付ける
- 各ゲームは通常の操作で 1 セッションを最後まで進められ、結果画面または対応する終了状態へ到達できる
- 不具合を修正したゲームは、同じローカル確認手順で再度プレイしても playability が維持される

## Acceptance Criteria

- `supportedGames` に含まれる全ゲームについて、local development で 1 回以上の手動プレイ確認が行われている
- 各ゲームで少なくとも初期描画、主要操作、終了到達の 3 点が確認されている
- playability を妨げる不具合が見つかったゲームは修正済みで、修正後に同じゲームを再プレイして確認できている
- 変更が入った場合は、関連する型検査または対象テストで回帰がないことを確認している

## Edge Cases

- 結果判定が成功だけでなく失敗やタイムアウトでも成立するゲームは、正常な終了状態に到達できれば確認完了とする
- fixture data 前提で動く local path と database-backed path の差異が見つかった場合は、今回の修正範囲に入るかを playability 影響で判断する
- 特定 viewport でのみ操作不能になる場合は、ローカル検証中に再現した viewport を基準に修正する

## Constraints and Dependencies

- `/docs/plans/plan.md` を active execution tracker として使い、完了後は archive する
- local verification は `npm run dev` と fixture fallback を前提に進める
- UI 変更を伴うため、実際のレンダリング確認を行いながら修正する

## Links

- Related: [product-specs.md](./product-specs.md)
- Related: [games/two-minute-expansion-wave.md](./games/two-minute-expansion-wave.md)
- Plan: [../plans/plan.20260314-150923.md](../plans/plan.20260314-150923.md)