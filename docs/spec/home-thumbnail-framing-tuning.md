# Home Thumbnail Framing Tuning

## Summary

ホーム画面のゲームカード preview で、`Number Chain`、`Pair Flip`、`Color Sweep` の thumbnail が周囲の余白を使い切れていない問題を調整し、同じ square frame の中で盤面がより大きく見えるようにする。

## User Problem

- 一部のゲーム thumbnail は card frame に対して盤面が小さく見え、周囲の余白が目立つ
- ゲームごとの情報密度が揃わず、他の thumbnail と比べて視認性が落ちる

## Scope

- ホーム画面の game card preview metadata に、必要なゲームだけ framing tuning を加える
- `Number Chain`、`Pair Flip`、`Color Sweep` の thumbnail を優先して調整する
- 他ゲームの preview layout は維持する

## Non-Goals

- ゲーム card 全体のレイアウト変更
- 他画面の artwork 再設計
- preview asset の全面差し替え

## Acceptance Criteria

- `Number Chain`、`Pair Flip`、`Color Sweep` の preview は現状より盤面が大きく見える
- 画像の主要部分が切れすぎず、frame 内で自然に見える
- 他のゲーム preview 表示は崩れない

## Links

- Plan: [../plans/plan.20260314-152459.md](../plans/plan.20260314-152459.md)