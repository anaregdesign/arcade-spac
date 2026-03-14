# Beat Match

## Summary

短い beat sequence に合わせて lane button を timing よく叩き、combo を切らさず run を完走する rhythm game。

## User Problem

- catalog に audio/beat 중심の timing game がない
- 既存 timing game は単発判定中心で、連続 combo 圧が薄い

## User-Visible Behavior

- 利用者は beat に同期して表示される prompt に合わせて button を tap する
- good/perfect timing で combo が伸び、miss で combo が切れる
- run は 90 秒前後で完結し、result に accuracy と max combo が出る

## Acceptance Criteria

- 1 run が 2 分以内に終わる
- combo、accuracy、miss が visible に表示される
- Result で primary metric と support metric が確認できる

## Distinction

- Pattern Echo の順序再現ではなく、連続 timing 精度が主題
