# Parser Engine

VS Code API に依存しない純粋なロジック層。
テスト容易性を最優先に設計。

## API

### detectAndParse(text, prefs): ParseResult

全パーサを実行し、スコアで最適なものを選ぶ。

```typescript
function detectAndParse(text: string, prefs: ParserPrefs): ParseResult;
```

### parseWith(parserId, text, options): ParseResult

パーサを明示指定して実行。

```typescript
function parseWith(parserId: string, text: string, options?: ParseOptions): ParseResult;
```

### validateAndScore(result): ScoredResult

パース結果の妥当性チェックと confidence 算出。

```typescript
function validateAndScore(result: RawParseResult): ScoredResult;
```

## パーサ一覧

| ID | 入力例 | 説明 |
|----|--------|------|
| `arrayTuple` | `[[1,2],[3,4],[5,6]]` | 数値タプルの配列 |
| `json` | `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}` | GeoJSON 形式 |
| `keyed` | `[{"x":1,"y":2},{"x":3,"y":4}]` | キー付きオブジェクト配列 |
| `csvLike` | `1,2\n3,4\n5,6` | CSV/TSV 風のテキスト |

## 自動判定のスコアリング

### 基本式

```
totalScore = parserScore + validityScore - penalty + prefBonus
```

- **parserScore**: パーサが入力をどれだけうまくパースできたか（0〜1）
- **validityScore**: パース結果が幾何学的に妥当か（0〜1）
- **penalty**: 警告や欠損データによる減点
- **prefBonus**: ユーザ設定（prefs）による加点・減点（例: JSON優先なら json に +0.1）

### ParserPrefs

```typescript
interface ParserPrefs {
  preferFormat: "auto" | "json" | "tuples" | "keyed";
  preferDim: "auto" | 2 | 3;
  preferGeometry: "auto" | "lineString" | "polygon" | "multiPolygon";
  autoModeThreshold: number;  // default: 0.5
}
```

### 低 confidence 時の挙動

- `confidence < autoModeThreshold` の場合:
  - Webview で候補リストを提示してユーザに選ばせる
  - 候補は score 降順で提示
  - ユーザの選択を記憶する機能は将来対応（任意）
