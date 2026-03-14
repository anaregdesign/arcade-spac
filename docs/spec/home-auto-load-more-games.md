# Home Auto Load More Games

## Summary

ホーム画面でゲーム一覧の下端までスクロールしたとき、追加のゲームカードを自動で読み込み、手動の `Show more games` 操作なしで catalog を連続閲覧できるようにする。

## User Problem

- 現在のホーム画面は一度に表示するゲーム数を絞っているが、続きのカードを見るには毎回 `Show more games` を押す必要がある
- ゲーム数が増えるほど、一覧を流し見したい利用者にとって手動読込が中断要因になる
- スクロール位置を戻したあとも同じ一覧文脈のまま次のゲーム群を自然に読み込みたい

## Users and Scenarios

- 利用者はホーム画面を下へスクロールしながら、追加のゲームカードを自動で読み込みたい
- 利用者はキーボードやタップだけでも引き続き次のゲーム群へ到達したい
- 開発者は既存の検索、フィルタ、ソート、scroll restore を壊さずに自動読込へ置き換えたい

## Scope

- ホーム画面のゲーム一覧下端を監視し、下方向スクロール後に追加のゲームカードを自動表示する
- 既存の 6 件ずつの段階的表示を維持したまま、読込トリガーだけを手動ボタン依存から scroll-driven に拡張する
- 検索、タグ filter、sort を変更したときの visible count reset を維持する
- 自動監視が利用できない場合や読込前に利用者が到達した場合の fallback として手動ボタンは残す

## Non-Goals

- ホーム画面のカードデザイン変更
- サーバー側 pagination の導入
- ゲーム一覧の並び順ロジック変更

## User-Visible Behavior

- ホーム画面で一度下にスクロールした利用者が一覧末尾へ近づくと、次のゲームカードが自動で表示される
- 検索、filter、sort を変えた後は一覧の先頭状態に戻り、以降のスクロールで再び自動読込される
- 自動読込が作動しない環境でも `Show more games` から同じ続きを開ける

## Acceptance Criteria

- ホーム画面の一覧末尾を viewport に近づけると、ゲームカードが 6 件ずつ追加表示される
- 初期表示直後に自動読込が暴発せず、少なくとも一度の下方向スクロール後に有効化される
- 検索、filter、sort を変更すると visible count は 6 件に戻る
- 手動ボタン fallback は残り、auto-load 後も追加カードの表示数と整合する

## Edge Cases

- 画面が高く一覧末尾がすぐ見える場合でも、利用者が下方向スクロールするまでは自動読込しない
- scroll restore 後にすでに下方向スクロール済みの状態なら、一覧末尾到達時の自動読込は妨げない
- 絞り込み結果が 6 件以下のときは自動読込トリガーが表示されなくても問題ない

## Constraints and Dependencies

- `/docs/plans/plan.md` を active execution tracker として使い、完了後は archive する
- home hub の既存 sessionStorage ベース state restore と両立させる
- 実レンダリング確認を伴うため、local browser verification を行う

## Links

- Related: [product-specs.md](./product-specs.md)
- Related: [ui-specs.md](./ui-specs.md)
- Plan: [../plans/plan.20260314-151252.md](../plans/plan.20260314-151252.md)