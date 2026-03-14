# CSS Module Adoption

## Summary

各 UI component の見た目をその component の近くへ閉じ込め、`app/app.css` には theme、reset、page shell、共通 utility などの global CSS だけを残す。

## User Problem

- 1 つの global stylesheet に component 固有の style が集まっているため、ある画面の見た目を直すだけでも他画面へ波及する不安がある
- component と style の距離が遠く、修正時にどの selector がどの画面に効いているのか追いにくい
- UI を追加・変更するたびに global CSS が肥大化し、保守コストが上がる

## Users and Scenarios

- 開発者は component を開いたとき、その component 専用の CSS をすぐ近くで確認・修正したい
- 開発者は screen や game workspace の style を変更しても、関係ない画面の style を意図せず壊したくない
- ユーザは CSS の配置変更後も、既存の画面表示と操作感が変わらず維持されることを期待する

## Scope

- component 固有の selector を CSS Modules へ移し、component と同じディレクトリまたは近い shared component ディレクトリに配置する
- component 側の `className` を CSS Module の参照に置き換える
- `app/app.css` から component ローカル CSS を削除し、global CSS のみを残す

## Non-Goals

- 画面レイアウトや copy の redesign
- 新しい UI component library の導入
- route、loader、action、domain logic の変更

## User-Visible Behavior

- Home、Rankings、Profile、Login、Result、各 game workspace の見た目は従来どおり維持される
- global theme、reset、page shell、shared action/button/input pattern はこれまでどおり全体に適用される
- component ごとの style 変更は、その component に閉じた CSS Module で管理できる

## Acceptance Criteria

- component 専用の style は CSS Module file として component の近くに存在する
- `app/app.css` には theme variable、reset、global layout、shared utility pattern だけが残る
- 対象 component は CSS Module import を使って表示崩れなく描画される
- 既存の build と typecheck が通る

## Edge Cases

- state に応じて class を切り替える game workspace の button、tile、cell でも CSS Module 参照で同じ見た目を維持できる
- responsive breakpoint と dark theme は global CSS と local CSS をまたいでも表示崩れを起こさない
- shared game workspace component は複数 game から使われても、必要な style を共通 CSS Module で再利用できる

## Constraints and Dependencies

- `app/root.tsx` の global stylesheet import は維持し、global CSS の entry point は変えない
- 既存の build / typecheck command を使って検証する

## Links

- Related: [product-requirements.md](./product-requirements.md)
- Related: [screen-flow.md](./screen-flow.md)
