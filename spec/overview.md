# 全体設計

## 目標UX

1. エディタでテキスト選択
2. コマンド実行（`coordGraph.showFromSelection`）
3. 自動判定 + パース
4. Webview パネルにグラフ表示
5. Webview 上の UI で即座に切り替え（2D/3D、パーサ、表示モードなど）

### 設定の優先度

- **デフォルト挙動**はユーザ設定（Settings）で決める
- **表示後の切替**はWebview UI で即座に反映（セッション内）
- 切り替えた設定を「ユーザ設定として保存」することも可能

## コンポーネント構成

```
┌─────────────────────────────────────────────┐
│  Extension Host（拡張本体）                   │
│  ┌───────────────┐  ┌────────────────────┐  │
│  │ Command Layer  │  │ Configuration      │  │
│  │ - 登録/実行    │  │ - 設定読み書き      │  │
│  └───────┬───────┘  └────────┬───────────┘  │
│          │                    │               │
│  ┌───────▼────────────────────▼──────────┐   │
│  │       Parser Engine（純ロジック）        │   │
│  │  - detectAndParse(text, prefs)         │   │
│  │  - parseWith(parserId, text, options)  │   │
│  │  - validateAndScore(result)            │   │
│  └───────────────────┬───────────────────┘   │
│                      │ postMessage            │
└──────────────────────┼───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│  Webview UI（HTML/JS、独立）                   │
│  - グラフ描画（scatter / polyline / 3D）       │
│  - 切替 UI（パーサ/次元/表示モード）            │
│  - 「設定を保存」ボタン                        │
└──────────────────────────────────────────────┘
```

## 責務分離

### Extension Host
- コマンド登録・実行
- 選択テキスト取得
- 設定読み取り・保存（`workspace.getConfiguration`）
- パース実行（Parser Engine 呼び出し）
- Webview へデータ送信 / Webview からの要求処理

### Parser Engine
- 純粋なロジック層（VS Code API に依存しない）
- テスト容易性を最優先
- 統一スキーマへの変換を担当

### Webview UI
- HTML/JS で独立
- Extension とは message passing で連携
- 描画ライブラリは Webview 内に閉じる

## 状態管理（3レイヤ）

| レイヤ | スコープ | 用途 |
|-------|---------|------|
| User/Workspace Settings | 永続 | ユーザが「基本はこれ」と決める |
| Session State | 拡張メモリ内 | 今開いてるWebviewの状態（即反映） |
| Document/Selection State | 都度 | 選択テキストから生成した parseResult |
