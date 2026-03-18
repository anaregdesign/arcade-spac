# Relative Pitch

## Summary

`Arcade` に `Relative Pitch` を追加する。reference interval を聴き、その関係を new base note 上で再現する candidate を選ぶ short-form ear training puzzle とする。

## User Problem

- current catalog には rhythm と timing game はあるが、relative pitch や interval recognition を主題にした audio discrimination game がない
- visual 以外の感覚を主軸にした short-form game を入れて catalog の skill family を広げたい

## Users and Scenarios

- 利用者は Home から `Relative Pitch` を開き、2 つの note の距離感を聴いて覚えたい
- 利用者は reference phrase、new base note、candidate note を replay しながら正しい interval match を選びたい
- 利用者は Result、profile、rankings で `clear time` と `replays used` を確認したい

## Scope

- `Relative Pitch` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `replays used` とする
- workspace では reference phrase、current base note、candidate pads、round progress、replay count を visible にする

## Non-Goals

- absolute pitch test
- full piano keyboard simulator
- long-form music theory lesson

## User-Visible Behavior

- idle overlay から run を開始すると audio context が user gesture で unlock され、reference phrase が再生される
- reference phrase は `anchor note -> target note` の 2 音で構成され、利用者は relative distance を聴き取る
- 続いて new base note が再生され、利用者は 3 から 4 個の candidate pads から「同じ interval を再現する note」を選ぶ
- correct choice は `rounds solved` を増やして次の round へ進み、wrong choice は round miss として扱われる
- 利用者は `Replay reference` と `Replay base` を使って確認できるが、使うたびに `replays used` が増える
- round が進むほど interval variety と distractor precision が上がる
- target solved count に達すると clear となり Result に遷移し、timer が切れた場合は fail として Result に遷移する

## Acceptance Criteria

- `Relative Pitch` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または fail が確定する
- reference interval、new base note、candidate selection の 3 段が明確に分かれている
- rhythm accuracy ではなく interval relation の識別が主題になっている
- Result、profile、rankings では `clear time` と `replays used` が保存される

## Edge Cases

- audio unlock 前の playback input は state を壊さず、利用者に retry path を示す
- muted environment でも note replay button label と current phase 表示は読めるが、音なしでの perfect completion は想定しない
- same round seed では reference phrase、base note、candidate order が deterministic に再現できる
- narrow viewport でも replay controls と candidate pads が touch-safe に収まる

## Constraints and Dependencies

- browser autoplay 制約に従い、audio は explicit start gesture 後のみ再生する
- pitch 表現は synth tone、chime、または short instrument sample のいずれでもよいが、interval 差が明確に聴き取れることを優先する

## Distinction

- `Beat Match` や `Tempo Hold` の rhythm timing ではなく、interval relation の聴き分けが主題
- `Icon Chain` の visual-memory inference ではなく、audio memory と pitch comparison が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
