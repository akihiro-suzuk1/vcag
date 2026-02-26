# 実装フェーズ

## 依存関係

```
Phase 1: 基本パイプライン
  ├──→ Phase 2: ユーザ設定
  ├──→ Phase 3: 自動判定エンジン
  │       ├──→ Phase 4: Webview インスタント切替
  │       └──→ Phase 5: MultiPolygon 対応
  └────────→ Phase 4 にも依存
```

---

## Phase 1: 基本パイプライン

**ゴール**: 選択テキスト → 2D タプルパース → Webview で scatter 表示

### やること

- [ ] コマンド `coordGraph.showFromSelection` 登録
- [ ] エディタから選択テキスト取得
- [ ] 統一スキーマの型定義（`Geometry`, `ParseMeta`, `ParseResult`）
- [ ] `arrayTuple` パーサ実装（`[[1,2],[3,4]]` 形式）
- [ ] Webview パネル作成
- [ ] 描画ライブラリ選定・組み込み
- [ ] scatter プロット描画
- [ ] Extension → Webview の `render` メッセージ送信

### 入力例

```
[[1,2],[3,4],[5,6],[7,8]]
```

### 完了条件

テキスト選択 → コマンド実行 → Webview に scatter プロットが表示される。

---

## Phase 2: ユーザ設定

**ゴール**: `coordGraph.*` 設定を VS Code 標準機構で定義・読み取り

### やること

- [ ] `package.json` に `contributes.configuration` スキーマ定義
- [ ] `workspace.getConfiguration()` での読み取りユーティリティ
- [ ] 設定値を Webview 初期化時に `init` メッセージで送信
- [ ] `saveSettings` メッセージ受信 → `config.update()` で保存

### 完了条件

設定画面で `coordGraph.defaultView` を変更 → 次回コマンド実行時に反映される。

---

## Phase 3: 自動判定エンジン

**ゴール**: 複数パーサを実行してスコアで最適を選ぶ

### やること

- [ ] パーサインターフェース定義
- [ ] `json` パーサ（GeoJSON）
- [ ] `keyed` パーサ（`[{x:1,y:2}]` 形式）
- [ ] `csvLike` パーサ（`1,2\n3,4` 形式）
- [ ] `detectAndParse(text, prefs)` 実装
- [ ] `validateAndScore(result)` 実装
- [ ] prefs による加点・減点
- [ ] 低 confidence 時の候補リスト生成
- [ ] 各パーサのユニットテスト

### 完了条件

異なる形式の入力を与えて、正しいパーサが自動選択される。
confidence が低い場合に候補リストが返る。

---

## Phase 4: Webview インスタント切替

**ゴール**: Webview UI で再パース/描画変更を即座に切り替え

### やること

- [ ] ツールバー UI（パーサ選択・次元・表示モード・geometry）
- [ ] 再パース系操作 → `reparse` メッセージ送信
- [ ] 描画系操作 → Webview 内 state 更新のみ
- [ ] `init` メッセージでの設定反映
- [ ] 「設定を保存」ボタン → `saveSettings` メッセージ
- [ ] 低 confidence 時の候補選択 UI

### 完了条件

Webview のドロップダウンでパーサや表示モードを切り替え、即座に反映される。

---

## Phase 5: MultiPolygon / Polygon 対応

**ゴール**: GeoJSON MultiPolygon 形式と独自配列形式の描画

### やること

- [ ] GeoJSON MultiPolygon パーサ（`coordinates: [[[[lng,lat],...]]]`）
- [ ] 独自形式 multi-polygon パーサ（`[[[x,y],...], [[x,y],...]]`）
- [ ] `Geometry.rings` / `Geometry.polygons` を使った描画
- [ ] Polygon 塗りつぶし・境界線描画
- [ ] MultiPolygon 複数ポリゴン同時表示
- [ ] 穴（hole）の描画対応
- [ ] `preferGeometry` 設定との連携

### 完了条件

GeoJSON MultiPolygon テキストを選択 → 複数ポリゴンが正しく描画される（穴も表示）。
