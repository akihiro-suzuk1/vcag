# VCAG — View Coordinates As Graph

A VS Code extension that extracts coordinate data from selected text and visualizes it as an interactive 2D/3D graph using Plotly.js.

This tool aims to let you quickly graph any coordinates simply by selecting text in your source code.

## Usage

1. Select text containing coordinate data in the editor
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run **Coord Graph: Plot Coordinates from Selection**
3. A graph appears in a Webview panel

## Supported Formats

```
# Labeled (x:1.0, y:2.0 / lat: 35.68, longitude: 139.76, etc.)
x: 1.0, y: 2.0
lat: 35.68, lng: 139.76

# JSON arrays
[[1, 2], [3, 4], [5, 6]]

# Parentheses (Point3::new(1,2,3) / with units: 100mm, 200mm, etc.)
(35.68, 139.76), (35.69, 139.77)
(100.0mm, 200.0mm)

# Braces (C/C++ initializer list)
{1.0, 2.0, 3.0}

# Semicolon (MATLAB, etc.)
1.0; 2.0; 3.0

# Comma-separated (tight / spaced)
1,2  1,2,3
10.0, 20.0
12.5, 22.3

# Space/tab (point clouds, OBJ, PLY, WKT, etc.)
1.0 2.0 3.0

# Scientific notation
1.5e2, 3.0e-1
```

Both 2D and 3D coordinates are automatically detected.

## Features

- **2D / 3D toggle** — Switch between XY 2D and 3D views for 3D data
- **Connect lines** — Draw lines between points in order to trace the path
- **Close loop** — Connect the last point back to the first to form a closed shape
- **Flip Y** — Reverse Y-axis (useful for screen coordinates)

## Installation

**From Open VSX** (VS Code, Cursor, VSCodium):

1. Open Extensions view
2. Search for "VCAG" or "Coord Graph"
3. Install

**From VSIX file**:

```bash
code --install-extension vcag-0.1.0.vsix
```

Or in VS Code: Extensions view → `...` → **Install from VSIX...** and select the `.vsix` file.

## Development

```bash
npm install
npm run compile   # Type check + build
npm run watch     # Watch mode (esbuild + tsc)
npm test          # Run tests
npm run build     # Package as .vsix
```

## License

MIT
