# VCAG — View Coordinates As Graph

A VS Code extension that extracts coordinate data from selected text and visualizes it as an interactive 2D/3D graph using Plotly.js, with optional map display via Leaflet.js + OpenStreetMap.

**Just select any text containing numbers — no formatting needed.** Works with messy, mixed-format data: debug output, log files, SVG paths, code snippets, whatever. VCAG greedily picks up coordinates from 8+ format patterns so you don't have to clean up your data first.

## Usage

### From selection (editor)

1. Select text containing coordinate data in the editor
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run **Coord Graph: Plot Coordinates from Selection**
3. A graph appears in a Webview panel

### From clipboard (terminal, debug console, etc.)

The editor selection API is not available when focus is on the terminal or debug console. Use the clipboard instead:

1. Select and copy (`Cmd+C` / `Ctrl+C`) the coordinate data (e.g. from terminal output, debug console, or any other view)
2. Run **Coord Graph: Plot Coordinates from Clipboard** from the Command Palette
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

# SVG path d attribute (M/L/H/V/C/Q/A/Z — curves are interpolated)
d="M 10 80 C 40 10 65 10 95 80"
M 0 0 L 100 0 L 100 100 Z

# Space/tab (point clouds, OBJ, PLY, WKT, etc.)
1.0 2.0 3.0

# Scientific notation
1.5e2, 3.0e-1
```

Both 2D and 3D coordinates are automatically detected. Formats can be mixed — VCAG picks up whatever it can find. Bezier curves (C/Q) and arcs (A) in SVG paths are smoothly interpolated rather than reduced to endpoints.

## Features

- **2D / 3D toggle** — Switch between XY 2D and 3D views for 3D data
- **Connect lines** — Draw lines between points in order to trace the path
- **Close loop** — Connect the last point back to the first to form a closed shape
- **Swap XY** — Swap X and Y values (useful for lat/lng reordering)
- **Flip Y** — Reverse Y-axis (useful for screen coordinates)
- **Map mode** — Display coordinates on an OpenStreetMap tile layer using Leaflet.js (toggle with the Map checkbox)

## Installation

**From Open VSX** (VS Code, Cursor, VSCodium):

1. Open Extensions view
2. Search for "VCAG" or "Coord Graph"
3. Install

**From VSIX file**:

```bash
code --install-extension vcag-0.3.1.vsix
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
