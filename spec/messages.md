# メッセージプロトコル（Extension ↔ Webview）

Extension と Webview は `postMessage` / `onDidReceiveMessage` で通信する。

## Extension → Webview

### init

Webview 初期化時に送信。設定とテーマ情報を渡す。

```typescript
{
  type: "init";
  settings: {
    preferFormat: string;
    preferDim: string | number;
    preferGeometry: string;
    defaultView: string;
    autoModeThreshold: number;
  };
  theme: "light" | "dark" | "highContrast";
}
```

### render

パース結果を送信し、描画を要求。

```typescript
{
  type: "render";
  geometry: Geometry;
  meta: ParseMeta;
  availableParsers: string[];
  candidates?: Array<{
    parserId: string;
    confidence: number;
    preview: string;  // 短い説明
  }>;
}
```

### error

パース失敗時のエラー通知。

```typescript
{
  type: "error";
  message: string;
  detail?: string;
}
```

## Webview → Extension

### reparse

パーサや解釈の変更を要求。指定されたフィールドのみ変更。

```typescript
{
  type: "reparse";
  parserId?: string;
  dim?: 2 | 3 | "auto";
  geometry?: string;
  keyedMap?: {
    x: string;
    y: string;
    z?: string;
  };
}
```

### saveSettings

現在の Webview 設定をユーザ設定として保存する要求。

```typescript
{
  type: "saveSettings";
  patch: {
    [key: string]: unknown;  // coordGraph.* の設定キーと値
  };
}
```

## シーケンス図

### 基本フロー（初回表示）

```
User          Extension Host          Parser Engine          Webview
 │                │                        │                    │
 │  選択+コマンド  │                        │                    │
 │───────────────>│                        │                    │
 │                │  detectAndParse(text)   │                    │
 │                │───────────────────────>│                    │
 │                │  ParseResult           │                    │
 │                │<───────────────────────│                    │
 │                │                        │                    │
 │                │  createWebviewPanel()                       │
 │                │─────────────────────────────────────────────>│
 │                │  postMessage(init)                          │
 │                │─────────────────────────────────────────────>│
 │                │  postMessage(render)                        │
 │                │─────────────────────────────────────────────>│
 │                │                        │                    │
```

### 再パースフロー

```
Webview                Extension Host          Parser Engine
  │                         │                        │
  │  reparse(options)       │                        │
  │────────────────────────>│                        │
  │                         │  parseWith(id, text)   │
  │                         │───────────────────────>│
  │                         │  ParseResult           │
  │                         │<───────────────────────│
  │  render(geometry, meta) │                        │
  │<────────────────────────│                        │
```

### 設定保存フロー

```
Webview                Extension Host
  │                         │
  │  saveSettings(patch)    │
  │────────────────────────>│
  │                         │  config.update(...)
  │                         │  (VS Code Settings に書き込み)
```
