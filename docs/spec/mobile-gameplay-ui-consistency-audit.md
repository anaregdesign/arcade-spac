# Cross-Viewport Gameplay UI Consistency Audit

## Summary

current catalog の 50 game を mobile と desktop の両 viewport で 1 本ずつ実際に確認し、mobile では初期 viewport で controls と primary playable area が収まり、desktop を含めて違和感なく遊べる UI へ揃える。

## User Problem

- game 数が 50 本まで増えたため、mobile と desktop の両方で route を開いたときの playability が game ごとにばらつきやすい
- 一部 game では controls card、button 配置、board 密度、summary panel の積み方が原因で、play 開始前から viewport 外に重要 UI が押し出されたり、desktop で間延びや偏りが出たりする可能性がある
- tap type game で button 位置の規則が揃っていないと、game を切り替えるたびに指の移動と認知負荷が増える
- mobile で primary tap button が上側に寄りすぎると、片手操作で押しづらく、board を見ながらの連続入力も不自然になる
- shared pattern だけでは吸収できない game-specific layout 差分があると、mobile で違和感のある UI が残る
- 類似した interaction pattern の game が毎回別レイアウトを持つと、tuning が game-specific CSS へ散り、mobile / desktop の一貫性と保守性が落ちる
- board 冒頭の title / description block が game ごとに位置も密度もばらつくと、viewport を無駄に消費しつつ共通 scaffold へ載せにくい
- HowToPlay で十分確認できる説明文まで board 上へ常設されると、mobile viewport を圧迫し、play 中の認知負荷も増える
- 一部 game は文字による説明量が多く、短い cue や visual sign へ落とせる情報まで prose で残っている

## Users and Scenarios

- プレイヤーは任意の game をスマホで開いたとき、scroll に頼らずすぐ play を始めたい
- プレイヤーは desktop で開いたときも、board、status、action の視線移動が不自然ではなく、余白や panel 配置に違和感なく play したい
- プレイヤーは tap type game で主要 button や lane selector が予測しやすい位置にあり、ゲーム間で学習コストが増えないことを期待する
- 開発者は 50 game を横断 audit し、shared fix と game-specific fix を切り分けながら commit を reviewable な粒度で積みたい

## Scope

- `supportedGames` に含まれる 50 game の mobile と desktop gameplay UI を route ごとに確認する
- 各 game について mobile viewport で `initial viewport`, `playable controls`, `tap target placement`, `overall comfort` を確認する
- 各 game について desktop viewport で `layout balance`, `action reachability`, `panel density`, `overall comfort` を確認する
- 必要に応じて shared gameplay UI と game-specific workspace UI の両方を修正する
- tap type game では主要 button 群の位置と配置規則を game 横断で揃える
- mobile で separate button 群を持つ game では、primary tap button を board 文脈を保ったまま lower area に寄せる
- desktop と mobile の両方で表示崩れや操作不能が出ないように再確認する
- current 50 game を gameplay layout archetype ごとに類型化し、同系統の game は `shared` に置いた共通 layout variant を使う
- board 冒頭の title / description は compact shared heading へ寄せ、説明文は optional にして mobile では冗長 copy を落とせるようにする
- gameplay 中の rule copy は HowToPlay に寄せ、board 上には phase, target, answer mode などその瞬間に必要な cue だけを残す
- 文字量が多い game は emoji ではなく stable icon / color / shape cue を優先し、それでも board copy が削れない場合だけ rule complexity も見直す

## Non-Goals

- 各 game のルール、score formula、result contract の再設計
- gameplay と無関係な home、rankings、profile の visual redesign
- touch target を壊す一律縮小で viewport 内に無理やり押し込むこと

## User-Visible Behavior

- どの game でも narrow mobile viewport で controls と primary playable area が初期表示内に収まりやすい
- play 中に主要操作のための縦スクロールが不要で、board と controls を往復しやすい
- tap type game の主要 button は game 間で近い配置規則を持ち、指の移動量と迷いが減る
- mobile で separate button を使う game は、主要 button が画面の下側で届きやすい位置にあり、上側へ散りすぎない
- desktop でも board、summary、controls のバランスが崩れず、間延び、情報の偏り、無駄な余白、視線移動の不自然さが抑えられる
- game ごとの固有 UI は残しつつ、違和感のある spacing、overflow、button placement、情報量の偏りが抑えられる
- 同じ interaction family の game は、個別 CSS の偶然一致ではなく、shared layout variant を通じて同じ構造原則で配置される
- game 冒頭の title / description block は位置と密度が揃い、mobile で縦方向の無駄な余白を作らない
- board 上の説明は HowToPlay と役割分担され、常設 copy は短い prompt と cue に絞られる
- instruction-heavy な game でも icon, color, shape で伝えられる情報は prose ではなく visual cue へ置き換わる

## Layout Archetypes

- `direct-board`: board 自体が primary tap target で、separate primary button を持たない game
- `answer-grid`: prompt or stage の下に answer / candidate button 群を置く game
- `tap-control`: board と separate tap button or lane button を組み合わせる game
- `twin-board`: target/live や original/changed のように 2 面比較を行う game
- `board-plus-sidecar`: board と tray, zone list, clue tray, side insight panel を併設する game
- `sequence-stage`: sequence strip や transformation stage の後に choice board を置く game

shared layout variant は少なくとも上記 archetype を吸収できることを目標にし、各 game は最も近い variant を使ったうえで固有 visual だけを feature CSS で持つ。

### Archetype Mapping

- `direct-board`: `Color Sweep`, `Bubble Spawn`, `Cascade Clear`, `Minesweeper`, `Number Chain`, `Pair Flip`, `Sudoku`, `Path Recall`, `Position Lock`, `Symbol Hunt`, `Hidden Find`, `Tap Safe`, `Rotate Align`, `Stack Sort`
- `answer-grid`: `Color Census`, `Relative Pitch`, `Pulse Count`, `Quick Sum`, `Hue Drift`, `Shape Morph`
- `tap-control`: `Beat Match`, `Merge Climb`, `Spinner Aim`, `Phase Lock`, `Sync Pulse`, `Glow Cycle`, `Tempo Hold`, `Tempo Weave`, `Orbit Tap`, `Precision Drop`, `Sum Grid`
- `twin-board`: `Light Grid`, `Spot Change`, `Flip Match`, `Tile Shift`, `Swap Solve`, `Tile Instant`, `Mirror Match`
- `board-plus-sidecar`: `Block Tessellate`, `Bounce Angle`, `Gap Rush`, `Box Fill`, `Line Connect`, `Chain Trigger`, `Icon Chain`, `Zone Lock`
- `sequence-stage`: `Cascade Flip`, `Pattern Echo`, `Sequence Point`, `Target Trail`

`board-plus-sidecar` のうち `Block Tessellate`, `Bounce Angle`, `Gap Rush`, `Icon Chain` は `tap-control` の sidecar subtype として扱い、mobile では primary button 群が board の下側へ寄る構図を優先する。

instruction-heavy outlier は `shared cue` と compact clue notation で吸収できたため、この audit 範囲では game rule simplification は不要と判断する。

## Acceptance Criteria

- `supportedGames` の 50 game すべてについて mobile / desktop UI の実確認結果が plan 上で追跡されている
- 各 game で少なくとも `mobile initial viewport`, `primary controls`, `play state`, `desktop layout comfort` の 4 点が確認されている
- mobile で primary playable area が controls に押し下げられすぎる game は修正済みで、修正後に同じ route で再確認されている
- tap type game では主要 button 配置の一貫性が改善され、極端に離れた or 不自然な placement が残っていない
- mobile で separate button 群を持つ game では、主要 button が thumb reach を意識した lower placement へ調整されている
- desktop で board と補助 panel のバランスに違和感がある game は修正済みで、修正後に再確認されている
- game ごとの layout 類型が整理され、同系統 game は shared layout variant を使う実装へ寄せられている
- shared fix と game-specific fix は reviewable な commit 粒度で記録されている
- typecheck と実 UI 再確認で、desktop/mobile の重大 regress がない
- redundant な board copy は HowToPlay へ移され、board 上の常設テキストは phase / prompt / target の cue レベルに収まっている
- text-heavy な game は icon / color / shape cue への置換が検討され、それでも冗長さが残る場合だけ rule simplification の必要性が評価されている

## Edge Cases

- board size の都合で viewport 内へ無理に縮小すると touch target が壊れる game は、touch-safe を優先して summary や補助 panel を圧縮する
- summary card が複数ある game は、play に不要な情報を board より上へ積みすぎない
- button を多く持つ tap type game は、片手操作で届きにくい上端や散りすぎた配置を避ける
- idle overlay、help dialog、finish card が mobile で board を隠しすぎる場合は、gameplay 優先で密度を再調整する
- desktop で board だけが左上に寄りすぎる、summary panel が過剰に大きい、または action 群が視線導線から外れる game は layout balance を再調整する
- board 自体が tap target の game は board 内 input を優先し、separate utility button だけを lower area に寄せる
- ルール理解に本質的でない補助 copy は HowToPlay へ逃がし、board 上は gameplay cue を優先する
- emoji は platform 差や意味のぶれがあるため、shared cue は stable icon と visual styling を優先する

## Constraints and Dependencies

- active execution tracker は `/docs/plans/plan.md` を使う
- 実確認は local development route を Playwright で開き、desktop と mobile viewport の両方で行う
- responsive fix は CSS と presentational component を優先し、interaction flow が変わる場合だけ usecase 側を触る
- shared layout variant は game-specific workspace 群から分離した `app/components/gameplay/` 配下で管理し、feature 側はそれを使って composition する
- legacy の cross-game workspace scaffold も `app/components/games/shared/` へ残さず、`app/components/gameplay/workspace/` のような neutral な場所へ集約する
- commit は shared pattern 修正と game-specific 修正を混ぜすぎない reviewable 粒度で作る

## Links

- Related: [local-gameplay-playability-audit.md](./local-gameplay-playability-audit.md)
- Related: [ui-specs.md](./ui-specs.md)
- Related: [product-specs.md#arcade-app-requirements](./product-specs.md#arcade-app-requirements)
- Plan: [../plans/plan.md](../plans/plan.md)
