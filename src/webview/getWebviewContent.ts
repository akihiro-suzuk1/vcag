import * as vscode from "vscode";
import { randomBytes } from "crypto";

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  coords: number[][],
  dim: "2D" | "3D"
): string {
  const plotlyUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "plotly.js-dist-min",
      "plotly.min.js"
    )
  );

  const nonce = randomBytes(16).toString("hex");

  const data = JSON.stringify(coords);

  return /* html */ `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coord Graph</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    #chart {
      width: 100%;
      height: 90vh;
    }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script nonce="${nonce}" src="${plotlyUri}"></script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function render(coords, dim) {
      const fg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-foreground').trim() || '#cccccc';
      const bg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-background').trim() || '#1e1e1e';

      const is3D = dim === '3D';

      const trace = {
        type: is3D ? 'scatter3d' : 'scatter',
        mode: 'markers',
        marker: { size: is3D ? 4 : 8, color: '#4dc9f6' },
        name: dim + ' (' + coords.length + ' points)',
        x: coords.map(c => c[0]),
        y: coords.map(c => c[1]),
      };

      if (is3D) {
        trace.z = coords.map(c => c[2]);
      }

      const layout = {
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { color: fg },
        margin: { l: 50, r: 20, t: 30, b: 50 },
      };

      if (!is3D) {
        layout.xaxis = { title: 'X', gridcolor: fg + '33' };
        layout.yaxis = { title: 'Y', gridcolor: fg + '33' };
      } else {
        layout.scene = {
          xaxis: { title: 'X', gridcolor: fg + '33', color: fg },
          yaxis: { title: 'Y', gridcolor: fg + '33', color: fg },
          zaxis: { title: 'Z', gridcolor: fg + '33', color: fg },
        };
      }

      Plotly.react('chart', [trace], layout, { responsive: true });
    }

    // Initial render with embedded data
    render(${data}, "${dim}");

    // Listen for update messages
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'render') {
        render(msg.coords, msg.dim);
      }
    });
  </script>
</body>
</html>`;
}
