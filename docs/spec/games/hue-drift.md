# Hue Drift

## Summary

連続する color gradient の変化を読み、欠けた 1 step を当てる color pattern puzzle。

## User-Visible Behavior

- gradient strip や tile row の一部が欠けている
- 利用者は candidate から正しい hue/saturation drift を選ぶ
- visual feedback で correct/wrong が即時に返る

## Acceptance Criteria

- 2 分以内で完結する round sprint
- 色差だけでなく明度や彩度も variation に入る
- Result に solved rounds と mistakes が出る

## Distinction

- Color Sweep の target 検索ではなく、連続色変化の推論が主題
