# Bounce Angle

## Summary

1 回の shot で wall bounce を利用し、goal pocket へ ball を導く geometry action puzzle。

## User-Visible Behavior

- 利用者は shot angle を決めて launch する
- ball は wall で反射し、goal pocket 到達で clear
- puzzle ごとに wall layout と hazard が変わる

## Acceptance Criteria

- 1 run は 2 分以内
- direct shot では届かない layout を含む
- Result に puzzles solved と shots used が出る

## Distinction

- Intercept Ball の受け操作ではなく、one-shot ricochet planning が core
