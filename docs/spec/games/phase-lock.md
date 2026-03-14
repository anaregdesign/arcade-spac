# Phase Lock

## Summary

異なる速度で回る複数 wheel を順に lock し、目標 phase alignment を作る spatial timing game。

## User-Visible Behavior

- wheel ごとに異なる speed/phase を持つ
- 利用者は適切な瞬間に tap して wheel を固定する
- 全 wheel が target band に収まると clear になる

## Acceptance Criteria

- 2 分以内に clear/fail が決まる
- wheel が 2 個以上あり multi-step timing になる
- Result に locked phases と total timing error が出る

## Distinction

- single hit timing ではなく複数 state を順に凍結する puzzle timing
