# Tempo Weave

## Summary

`Arcade` に `Tempo Weave` を追加する。left と right の independent beat lane を同時に見続け、lane ごとの timing window で tap して split attention streak を維持する dual-lane rhythm game とする。

## User Problem

- `Beat Match` は single active lane を追う rhythm game で、複線処理の split attention が足りない
- `Tempo Hold` は single timing target に集中する設計で、左右同時監視の負荷を持つ compact rhythm challenge が不足している

## Users and Scenarios

- 利用者は Home から `Tempo Weave` を開き、left と right の lane marker を同時に読みたい
- 利用者は lane ごとに異なる tempo で target zone を通る marker を見て、対応する lane button を正しい timing で tap したい
- 利用者は Result、profile、rankings で `clear time` と `misses` を確認し、workspace と finish summary で best streak と lane accuracy を読みたい

## Scope

- `Tempo Weave` を home、workspace、result、rankings、profile に統合する
- primary metric は `clear time`、support metric は `misses` とする
- workspace と finish summary では current streak、best streak、left/right lane accuracy、density level を見せる

## Non-Goals

- music playback 同期
- freeform chart editor
- keyboard-only expert chart input

## User-Visible Behavior

- run を開始すると left/right lane の timing marker が独立した tempo で動き始める
- 各 lane は center target zone を持ち、利用者は対応する lane button を target zone 内で tap する
- success した lane はその lane だけ次 beat cycle に進み、miss または放置で streak が切れて lane が再開する
- streak が続くほど density level が上がり、両 lane の tempo が少しずつ速くなる
- 両 lane の hit goal を満たすと Result へ遷移する
- Result、profile、rankings では `clear time` と `misses` を確認でき、finish summary では best streak と lane accuracy を読める

## Acceptance Criteria

- `Tempo Weave` card が Home に表示され、game route を開ける
- 1 run は 2 分以内に clear または timeout が確定する
- left/right lane は異なる tempo で independent に進み、single-lane rhythm と異なる dual-attention challenge を持つ
- workspace 上で current streak、best streak、lane progress、density level、lane accuracy、time remaining が visible に更新される
- Result、profile、rankings では `clear time` と `misses` が保存される

## Edge Cases

- idle preview は hydration drift を起こさない
- live でない状態の lane tap は state を変えない
- one lane を clear 済みにしても、もう一方の lane は通常どおり miss と density reset の対象になる

## Constraints and Dependencies

- shared workspace card、board overlay、finish card、result flow を再利用する
- deterministic Playwright selector を root と lane button に付け、lane phase、window state、hit progress、streak、density、run completion を読めるようにする
- narrow viewport でも dual-lane controls が readable で touch-safe である

## Distinction

- `Beat Match` の single active lane combo ではなく、2 本の lane を常時監視する split attention が主題
- `Tempo Hold` の single hold timing ではなく、lane ごとの independent beat cycle を読み分ける負荷が主題

## Links

- Related: [../product-specs.md#arcade-app-requirements](../product-specs.md#arcade-app-requirements)
- Related: [../game-catalog-50-expansion-program.md](../game-catalog-50-expansion-program.md)
