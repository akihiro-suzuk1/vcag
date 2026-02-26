# ユーザ設定

VS Code 標準の `contributes.configuration` で定義。
`workspace.getConfiguration("coordGraph")` で読み取る。

## 設定キー一覧

| キー | 型 | デフォルト | 説明 |
|------|------|----------|------|
| `coordGraph.preferFormat` | `string` | `"auto"` | 優先パーサ形式。`"auto"` / `"json"` / `"tuples"` / `"keyed"` |
| `coordGraph.preferGeometry` | `string` | `"auto"` | 優先ジオメトリ解釈。`"auto"` / `"lineString"` / `"polygon"` / `"multiPolygon"` |
| `coordGraph.preferDim` | `string \| number` | `"auto"` | 優先次元。`"auto"` / `2` / `3` |
| `coordGraph.defaultView` | `string` | `"scatter"` | デフォルト表示モード。`"scatter"` / `"polyline"` / `"xyzSeries"` |
| `coordGraph.autoModeThreshold` | `number` | `0.5` | 自動判定の confidence 閾値。これ未満で候補提示 |
| `coordGraph.rememberLastChoices` | `boolean` | `false` | Webview での切替を次回起動時に引き継ぐか |

## package.json での定義例

```jsonc
{
  "contributes": {
    "configuration": {
      "title": "Coordinate Graph",
      "properties": {
        "coordGraph.preferFormat": {
          "type": "string",
          "default": "auto",
          "enum": ["auto", "json", "tuples", "keyed"],
          "description": "優先するパーサ形式"
        },
        "coordGraph.preferGeometry": {
          "type": "string",
          "default": "auto",
          "enum": ["auto", "lineString", "polygon", "multiPolygon"],
          "description": "優先するジオメトリ解釈"
        },
        "coordGraph.preferDim": {
          "type": ["string", "number"],
          "default": "auto",
          "enum": ["auto", 2, 3],
          "description": "優先する次元"
        },
        "coordGraph.defaultView": {
          "type": "string",
          "default": "scatter",
          "enum": ["scatter", "polyline", "xyzSeries"],
          "description": "デフォルト表示モード"
        },
        "coordGraph.autoModeThreshold": {
          "type": "number",
          "default": 0.5,
          "minimum": 0,
          "maximum": 1,
          "description": "自動判定の確信度閾値（これ未満で候補を提示）"
        },
        "coordGraph.rememberLastChoices": {
          "type": "boolean",
          "default": false,
          "description": "Webview での設定切替を次回に引き継ぐ"
        }
      }
    }
  }
}
```

## 読み取り方

```typescript
const config = vscode.workspace.getConfiguration("coordGraph");
const preferFormat = config.get<string>("preferFormat", "auto");
const threshold = config.get<number>("autoModeThreshold", 0.5);
```

## 書き込み方（Webview からの保存要求時）

```typescript
const config = vscode.workspace.getConfiguration("coordGraph");
await config.update("preferFormat", "json", vscode.ConfigurationTarget.Global);
```
