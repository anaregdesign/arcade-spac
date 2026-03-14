# Sequence Point

## Summary

一瞬だけ点灯した location sequence を長さが伸びる round ごとに再入力する working memory game。

## User-Visible Behavior

- watch phase で location sequence を見せる
- input phase で同じ順に tap する
- round success ごとに sequence length が増える

## Acceptance Criteria

- 2 分以内に複数 round 進行する
- Path Recall より短い flashes と high-tempo progression を持つ
- Result に max sequence length と mistakes が出る

## Distinction

- fixed path tracing ではなく abstract point sequence の伸長が core
