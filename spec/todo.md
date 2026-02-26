# TODO - 実装ロードマップ

## Proto 1: 正規表現で座標抽出 → ユーザに表示

- [ ] テスト環境セットアップ（vitest）
- [ ] `extractCoordinates(text)` のテスト作成（Red）
  - 2D: `1,2 3,4 5,6` → `[[1,2],[3,4],[5,6]]`
  - 3D: `1,2,3 4,5,6` → `[[1,2,3],[4,5,6]]`
  - 改行区切り: `1,2\n3,4` → `[[1,2],[3,4]]`
  - 空文字・座標なし → `[]`
  - ノイズ混じり: `foo 1,2 bar 3,4` → `[[1,2],[3,4]]`
- [ ] `extractCoordinates(text)` の実装（Green）
- [ ] リファクタリング（Refactor）
- [ ] VS Code コマンド `coordGraph.showFromSelection` で選択テキスト→抽出→表示

## Proto 2: 抽出した座標を Webview でグラフ表示

- [ ] Webview パネル作成
- [ ] 描画ライブラリ選定・組み込み
- [ ] scatter プロット描画
- [ ] Extension → Webview メッセージ送信

## Brushup: 本格設計への接続

- [ ] 統一スキーマ（Geometry / ParseMeta）導入
- [ ] 複数パーサ + 自動判定エンジン
- [ ] ユーザ設定（contributes.configuration）
- [ ] Webview インスタント切替 UI
- [ ] MultiPolygon 対応
- [ ] 詳細は `spec/` ディレクトリ参照
