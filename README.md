# VCAG — View Coordinates As Graph

A VS Code extension that extracts coordinate data from selected text and visualizes it as an interactive graph.

## Usage

1. Select text containing coordinate data in the editor
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run **Coord Graph: Plot Coordinates from Selection**
3. A graph appears in a Webview panel

## Supported Formats

```
# Tuple arrays
(35.68, 139.76), (35.69, 139.77)

# JSON arrays
[[1, 2], [3, 4], [5, 6]]

# CSV-like
10.0, 20.0
12.5, 22.3
15.0, 25.1

# Labeled
x: 1.0, y: 2.0
x: 3.0, y: 4.0

# Scientific notation
1.5e2, 3.0e-1
```

Both 2D and 3D coordinates are automatically detected.

## Features

- **2D / 3D toggle** — Switch between XY 2D and 3D views for 3D data
- **Connect lines** — Draw lines between points in order to trace the path
- **Close loop** — Connect the last point back to the first to form a closed shape

## Installation

```
code --install-extension vcag-0.0.1.vsix
```

Or in VS Code: Extensions view → `...` → **Install from VSIX...** and select the `.vsix` file.

## Development

```bash
npm install
npm run compile   # Build
npm test          # Test
```

## License

MIT
