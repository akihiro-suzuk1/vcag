# VCAG (VS Code Auto Graph) 仕様書

座標データを選択→自動判定・パース→グラフ表示する VS Code 拡張。

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| [overview.md](./overview.md) | 全体設計・目標UX |
| [data-model.md](./data-model.md) | 統一スキーマ（Geometry / ParseMeta） |
| [parser-engine.md](./parser-engine.md) | パーサ群・自動判定・スコアリング |
| [webview.md](./webview.md) | Webview UI・描画・インスタント切替 |
| [settings.md](./settings.md) | ユーザ設定（contributes.configuration） |
| [messages.md](./messages.md) | Extension ↔ Webview メッセージプロトコル |
| [phases.md](./phases.md) | 実装フェーズ・依存関係 |

## コマンド

| コマンドID | 説明 |
|-----------|------|
| `coordGraph.showFromSelection` | 選択範囲を解析してグラフ表示 |
| `coordGraph.saveCurrentAsDefault` | 現在のWebview設定をユーザ設定に保存 |
