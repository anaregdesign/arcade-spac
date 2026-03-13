# Drop Line Game

## Summary

`Arcade` に 3 本目の game として `Drop Line` を追加する。上から落下する 1 つの ball が下部の line と重なる瞬間を狙って click または tap し、ball と line の距離が小さいほど高得点になる timing game を提供する。

## User Problem

- 既存 game は board puzzle 中心で、短時間で感覚的に遊べる reflex 系 game がない
- 1 run が短く、すぐ replay できる game がないため、home から気軽に遊び始める選択肢が少ない
- 総合 points を伸ばす手段が puzzle solve だけだと、プレイスタイルの幅が狭い

## Users and Scenarios

- ユーザは home から `Drop Line` を選び、短い 1 run をすぐ始めたい
- ユーザは falling ball と target line の位置関係だけに集中し、重なった瞬間に画面を click または tap したい
- ユーザは run の直後に、自分の hit 精度と rankings への影響を result で確認したい
- ユーザは miss した場合でも、何が起きたかを理解してすぐ replay したい

## Scope

- `Drop Line` を home の game list、game screen、result、rankings、profile に統合する
- 1 本の vertical lane 内で 1 つの ball が落下するシンプルな play loop を提供する
- `difficulty` ごとに落下 speed を変え、game ごとの難易度差を作る
- score metric は `line offset` とし、line 中心と ball 中心の距離を `px` で扱う

## Non-Goals

- 複数 ball の同時出現
- combo、連続 round、power-up、particle effect などの追加 game loop
- 音声 feedback や vibration の最適化
- dedicated tutorial screen や onboarding overlay

## User-Visible Behavior

- home で `Drop Line` card が既存 game と同じ導線で表示される
- game screen では `difficulty` を選んで `Start run` すると、ball が random な高さから落下し始める
- live run 中に play area を click または tap すると、その時点の `line offset` を計測して run を終了し、自動で result へ遷移する
- `line offset` が小さいほど良い result として扱い、home、profile、result では best metric を `px` 表示する
- ball が line を通過して play area の下端まで落ちても click されなかった場合、その run は miss として扱い、result へ自動遷移する
- game screen には current state、difficulty、`How to play` を既存 pattern で表示し、cross-game navigation は `app shell` または result から行える
- result screen では `Drop Line` 用の metric label と summary を表示し、`px` 単位の hit 精度がわかる
- rankings と profile では `Drop Line` が他 game と同じように board 対象として扱われる

## Acceptance Criteria

- ユーザは home から `Drop Line` を選択して game screen を開ける
- ユーザは mouse click と touch tap の両方で run を完了できる
- live run 中の 1 回の click または tap で result が保存され、追加の confirm 操作なしに result screen へ遷移する
- result screen では `Drop Line` の primary metric が `px` 表示になり、time 表示にならない
- ball を click しないまま落とし切った場合は miss として result が保存され、rankings 対象外になる
- `Drop Line` の best record と ranking scope が profile と rankings に表示される

## Edge Cases

- run 開始前や result 遷移中の click は score に反映しない
- route を離れても live run は自動で hit または miss として保存しない
- random な開始高さでも ball が line より下から spawn しない
- narrow viewport でも play area 全体、line、ball、主要 actions が 1 画面内で操作できる
- miss 後も replay 導線は直ちに利用できる

## Constraints and Dependencies

- 既存の `games.$gameKey` route と共通 result 保存 flow を再利用する
- `primaryMetric` は `Drop Line` だけ `px`、既存 game は従来通り duration 表示を維持する
- home、result、profile、rankings、fixture data の game list を 3 game 前提に更新する

## Links

- Related: [../product-requirements.md](../product-requirements.md)
- Flow: [../screen-flow.md](../screen-flow.md)
