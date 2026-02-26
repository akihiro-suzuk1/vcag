# データモデル（統一スキーマ）

パーサの出力とWebviewの入力を統一するスキーマ。
どの入力形式でも、描画側は同じコードで扱える。

## Geometry

```typescript
interface Geometry {
  /** 幾何タイプ */
  type: "PointSeries" | "LineString" | "Polygon" | "MultiPolygon";

  /** 次元 */
  dim: 2 | 3;

  /** 点列（PointSeries / LineString で使用） */
  points: Point[];

  /** リング列（Polygon で使用: 外環 + 穴） */
  rings?: Point[][];

  /** ポリゴン列（MultiPolygon で使用） */
  polygons?: Polygon[];
}

interface Point {
  x: number;
  y: number;
  z?: number;
  /** 元データでのインデックス */
  idx: number;
}

interface Polygon {
  /** 外環 + 穴のリング列 */
  rings: Point[][];
}
```

## ParseMeta

```typescript
interface ParseMeta {
  /** 使用したパーサID */
  parserId: "json" | "arrayTuple" | "keyed" | "csvLike";

  /** 判定の確信度（0〜1） */
  confidence: number;

  /** パース時の警告 */
  warnings: string[];

  /** 統計情報 */
  stats: {
    pointCount: number;
    hasZ: boolean;
    rangeX: [number, number];
    rangeY: [number, number];
    rangeZ?: [number, number];
  };
}
```

## ParseResult

```typescript
interface ParseResult {
  geometry: Geometry;
  meta: ParseMeta;
}
```

## 型の関係

```
入力テキスト
  → Parser Engine
    → ParseResult { geometry, meta }
      → Webview へ送信
        → 描画
```
