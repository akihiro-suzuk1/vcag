import * as vscode from "vscode";
import { randomBytes } from "crypto";

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  coords: number[][],
  dim: "2D" | "3D"
): string {
  const chartJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "chart.js",
      "dist",
      "chart.umd.js"
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
    content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coord Graph</title>
  <style nonce="${nonce}">
    body {
      margin: 0;
      padding: 16px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    canvas {
      max-width: 100%;
      max-height: 90vh;
    }
  </style>
</head>
<body>
  <canvas id="chart"></canvas>
  <script nonce="${nonce}" src="${chartJsUri}"></script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function render(coords, dim) {
      const ctx = document.getElementById('chart').getContext('2d');
      const fg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-foreground').trim() || '#cccccc';

      const dataPoints = coords.map(c => ({ x: c[0], y: c[1] }));

      if (window.__chart) {
        window.__chart.destroy();
      }

      window.__chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: dim + ' (' + coords.length + ' points)',
            data: dataPoints,
            backgroundColor: '#4dc9f6',
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: fg } }
          },
          scales: {
            x: {
              ticks: { color: fg },
              grid: { color: fg + '33' },
              title: { display: true, text: 'X', color: fg }
            },
            y: {
              ticks: { color: fg },
              grid: { color: fg + '33' },
              title: { display: true, text: 'Y', color: fg }
            }
          }
        }
      });
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
