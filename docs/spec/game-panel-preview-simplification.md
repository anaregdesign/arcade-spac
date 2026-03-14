# Game Panel Preview Simplification

## Summary

Home の各ゲームパネルに表示する preview image で、盤面を囲う内側フレームのサイズと余白を整えて、内容に対して自然な見え方にする。

## User Problem

- 一部のゲーム preview は内側フレームのサイズが内容に対して不自然で、盤面が枠からはみ出して見える
- game panel の一覧で複数カードを並べたとき、フレームの余白バランスが崩れて見える

## Users and Scenarios

- ユーザは Home のゲーム一覧を流し見しながら、各ゲームの雰囲気をすばやく見分けたい
- ユーザは preview 内の盤面や色、数字、カード配置を主情報として見たい

## Scope

- Home の game preview 画像で、内側フレームのサイズと余白を中身に合わせて調整する
- ラベル文字や盤面の可読性は維持する

## Non-Goals

- Home カード全体のレイアウト変更
- preview 画像の全面的な描き直し
- 実ゲーム画面のUI変更

## User-Visible Behavior

- Color Sweep、Number Chain、Pair Flip の preview では、内側フレームが盤面を自然に囲むサイズになる
- 盤面や記号が枠からはみ出して見えず、ゲームごとの見分けやすさは維持される

## Acceptance Criteria

- 対象 preview 画像で、内側フレームが主要要素を不自然に切らない
- フレームの上下左右の余白が視覚的に安定する
- カード一覧で preview の違和感が減る

## Edge Cases

- フレームを調整してもラベル文字や主要要素が窮屈にならない
- 盤面がフレームの外へはみ出して見えない

## Constraints and Dependencies

- 既存の画像アセット差し替えで完結させ、Home カードの実装コードは変えない

## Links

- Related: [product-requirements.md](./product-requirements.md)

