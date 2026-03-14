# Tap Safe

## Summary

大量に湧く object の中から safe target だけを素早く tap し、hazard を避ける visual reflex game。

## User-Visible Behavior

- safe と hazard が短時間だけ混在表示される
- 利用者は safe target のみを tap して score を稼ぐ
- hazard tap で large penalty、safe missed で small penalty が入る

## Acceptance Criteria

- 2 分以内の timed run
- object differentiation が color だけに依存しない
- Result に safe hits、hazard taps、accuracy が出る

## Distinction

- Symbol Hunt より短い判断 window と high-pressure filtering が主題
