# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VCAG (View Coordinates As Graph) is a VS Code extension that extracts coordinate data from selected text and visualizes it as an interactive 2D/3D graph using Plotly.js.

## Commands

```bash
npm run compile       # Type check + esbuild (dev)
npm run watch         # Parallel watch for esbuild & tsc
npm test              # Run all tests (vitest)
npm run test:watch    # Run tests in watch mode
npm run build         # Package as .vsix for distribution
```

To run a single test file:
```bash
npx vitest run src/__tests__/extractCoordinates.test.ts
```

## Architecture

**Data flow:** Text selection → `extractCoordinates()` → dimension detection (2D/3D) → Webview with Plotly.js

Three main components:

- **`src/extension.ts`** — VS Code command registration, reads selection, creates/reuses webview panel, posts data via message passing
- **`src/parseSvgPath.ts`** — Pure function `parseSvgPath(d): number[][]`. Parses SVG path `d` attribute using `svgpath` library, extracts endpoint coordinates with Bezier curve interpolation (8-segment subdivision)
- **`src/extractCoordinates.ts`** — Pure function `extractCoordinates(text): number[][]`. Supports 8+ format patterns (SVG path, labeled, JSON array, parentheses, braces, semicolon, tight comma, space/tab). Uses priority ordering with overlap tracking to avoid double-matching
- **`src/webview/getWebviewContent.ts`** — Generates self-contained HTML with embedded data, Plotly.js rendering, and toolbar controls (2D/3D toggle, connect lines, close loop, flip Y). Uses nonce-based CSP. Reads VS Code theme CSS variables for styling

The webview JS runs entirely client-side — toolbar state changes re-invoke `render()` without messaging the extension host.

## Build

esbuild bundles `src/extension.ts` → `dist/extension.js` (CommonJS). The `vscode` module is external. Plotly.js is loaded in the webview from `node_modules` via `webview.asWebviewUri()`, not bundled into the extension JS.

## Testing

Tests use vitest with `vscode` module mocked. The coordinate extractor is a pure function tested directly. The webview generator tests check HTML output for expected elements and attributes.

## Release (Open VSX)

Open VSX への公開には `ovsx` CLIを使う（グローバルインストール済み）。
同じバージョンは再公開不可なので、必ずバージョンアップしてからリリースすること。

リリーススクリプト（`scripts/release.sh`）でバージョンアップ・ビルド・Open VSX公開・GitHub Release作成を一括実行できる：

```bash
npm run release -- patch   # 0.0.x → 0.0.x+1
npm run release -- minor   # 0.x.0 → 0.x+1.0
npm run release -- major   # x.0.0 → x+1.0.0
```

アイコンは `images/icon.png`（128×128 PNG）。SVG原本は `images/icon.svg`。
