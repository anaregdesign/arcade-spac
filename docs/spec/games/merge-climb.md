# Merge Climb

## Summary

小さい value tile を merge して goal threshold へ最短で到達する compact growth puzzle。

## User-Visible Behavior

- board 上で tile を move して same value を merge する
- low move count で threshold tile を作るほど高評価になる
- board が埋まる前に目標値へ到達すると clear

## Acceptance Criteria

- 2 分以内で clear/fail が決まる
- 2048 風でも endless ではなく clear threshold sprint にする
- Result に max value、moves used、clear flag が出る

## Distinction

- Stack Sort や Tile Shift と異なり numeric growth planning が主題
