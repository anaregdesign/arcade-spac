# Intercept Ball

## Summary

反射する ball の landing point を読んで pad を移動し intercept する prediction-reflex game。

## User-Visible Behavior

- ball が wall に bounce しながら進む
- 利用者は paddle を動かして指定 zone で intercept する
- successful intercept で next shot に進む

## Acceptance Criteria

- 2 分以内の shot-based run
- simple pong clone ではなく、target intercept zone 条件を持つ
- Result に successful intercepts と miss streak が出る

## Distinction

- continuous rally ではなく、prediction-heavy discrete shot challenge
