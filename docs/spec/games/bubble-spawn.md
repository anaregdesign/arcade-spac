# Bubble Spawn

## Summary

growing bubble を burst して overcrowd を防ぐ arcade management game。

## User-Visible Behavior

- small bubble が継続的に spawn し、時間経過で成長する
- 利用者は適切な順番で burst して連鎖や space 回収を狙う
- field saturation が limit を超えると fail

## Acceptance Criteria

- 2 分以内で clear/fail が決まる
- priority management と chain burst の両方がある
- Result に longest survival、bubbles popped、chain bonus が出る

## Distinction

- reflex only ではなく、space pressure management が core
