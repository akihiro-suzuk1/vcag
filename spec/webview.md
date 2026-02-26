# Webview UI

HTML/JS で実装。Extension とは message passing で連携。

## 描画

描画ライブラリは Webview 内に閉じる（候補: Chart.js / Plotly / ECharts）。

### 表示モード

| モード | 説明 |
|-------|------|
| `scatter` | 点のみ表示 |
| `polyline` | 点を線で結ぶ |
| `xyzSeries` | X軸にインデックス、Y軸に座標値（時系列的表示） |

## インスタント切替

「再パースが必要な操作」と「描画だけ変える操作」を分離し、体験を最適化する。

### A) 再パース必要（Extension に依頼）

以下の変更は Extension 側で再パースが必要:

- パーサ選択（json / tuples / keyed / csvLike）
- 次元解釈（2D / 3D / auto）
- geometry 解釈（MultiPolygon / Polygon / LineString）
- 軸割当（keyed パーサで x/y/z のキーを変更）

→ `postMessage({ type: "reparse", options })` を送信

### B) 描画のみ変更（Webview 内完結）

以下の変更は Webview 内の state 更新だけで済む:

- scatter / polyline / xyzSeries 表示切替
- 表示範囲（auto scale / fixed）
- 点サイズ、線の有無
- インデックスを時間軸にするかどうか

→ postMessage 不要

## UI 構成

```
┌─────────────────────────────────────┐
│ ツールバー                           │
│ [パーサ: auto ▼] [次元: 2D ▼]       │
│ [表示: scatter ▼] [geometry: auto ▼] │
│                      [設定を保存]    │
├─────────────────────────────────────┤
│                                     │
│           グラフ描画領域              │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## テーマ対応

- VS Code の現在のテーマ（light / dark / high contrast）を取得
- Webview の背景色・テキスト色を合わせる
- CSS Variables で VS Code テーマカラーを参照
