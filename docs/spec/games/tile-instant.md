# Tile Instant

## Summary

短時間だけ表示された tile arrangement を即座に再配置する flash reconstruction game。

## User-Visible Behavior

- watch phase で完成形 board を短く表示する
- input phase で shuffled board を swap して再現する
- 制限手数または短い timer 内で正解すると round clear

## Acceptance Criteria

- 1 run は 2 分以内
- Tile Shift との差分として、正解形の長期推論ではなく瞬間記憶再構築が中心
- Result に rounds solved と average moves が出る

## Distinction

- memory first、swap solve second の二段階構成
