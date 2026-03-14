# Game Workspace Shared Components

## Summary

複数 game の workspace で共通になっている controls card、board 上の start overlay、finish card を shared React Component に集約し、見た目と操作を揃えたまま保守しやすくする。

## User Problem

- game ごとの workspace で同じ UI 構造を個別実装すると、label、spacing、disabled 表現がずれやすい
- 一部の game だけ修正されて他が古いまま残ると、ゲーム横断 UI の一貫性が崩れる
- 同じ変更を複数 file に反映する必要があり、small UI change でも regress の確率が上がる

## Users and Scenarios

- ユーザはどの game を開いても、difficulty、run status、primary actions、finish summary が同じ UI pattern で並んでいると理解しやすい
- 開発者は共通 UI を 1 か所直すだけで複数 game へ一貫して反映したい

## Scope

- game workspace の共通 controls card を shared React Component に切り出す
- game workspace の共通 board start overlay を shared React Component に切り出す
- game workspace の共通 finish card を shared React Component に切り出す
- 各 game workspace は board 固有 UI と game-specific action だけを持つ構成へ整理する

## Non-Goals

- 各 game の play rule や scoring の変更
- result、rankings、profile の layout 変更
- game-specific board UI の共通化

## User-Visible Behavior

- マインスイーパ、数独、Drop Line の game screen で、上部 controls card と下部 finish card の構造と spacing は今まで通り維持される
- 未開始 state では board 上に `Start run` overlay が表示され、最初の action を board の近くで始められる
- difficulty selector、run status chips、primary actions、board overlay、finish summary の配置順は全 game で共通 pattern を保つ
- game 固有の action は従来どおり残し、共通 card の中で同じ操作感で表示される
- 共通 card の修正が必要になった場合も、全 game で同時に揃った見た目を維持できる

## Acceptance Criteria

- game workspace 3 画面の controls card が shared React Component 経由で描画される
- game workspace 3 画面の idle board overlay が shared React Component 経由で描画される
- game workspace 3 画面の finish card が shared React Component 経由で描画される
- 各 game workspace は board 固有部分と game 固有 action / status 内容だけを持つ
- 既存の操作導線、disabled 条件、result 遷移タイミングは変わらない
- desktop と mobile の両方で controls card と finish card の表示崩れが起きない

## Edge Cases

- game ごとに primary actions の数が異なっても共通 controls card で表示できる
- board start overlay の文言は game ごとに変えても、layout と button affordance は共通に保てる
- finish card に secondary action がある game とない game の両方を扱える
- board 幅が game ごとに異なっても、共通 card の幅や spacing が破綻しない

## Constraints and Dependencies

- shared UI は `app/components/games/shared/` 配下の React Component として配置する
- 各 game workspace の session Hook や submit logic は維持し、presentational な共通化に留める

## Links

- Related: [product-requirements.md](./product-requirements.md)
- Related: [screen-flow.md](./screen-flow.md)
