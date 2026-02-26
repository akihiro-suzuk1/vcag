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
    #toggle-dim {
      display: none;
      margin-bottom: 8px;
      padding: 4px 12px;
      cursor: pointer;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 2px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    #toggle-dim:hover {
      background: var(--vscode-button-hoverBackground);
    }
  </style>
</head>
<body>
  <button id="toggle-dim">XY 2D で表示</button>
  <div id="chart"></div>
  <script nonce="${nonce}" src="${plotlyUri}"></script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    let currentViewAs = "${dim}";
    const dataDim = "${dim}";
    const toggleBtn = document.getElementById('toggle-dim');

    if (dataDim === '3D') {
      toggleBtn.style.display = 'inline-block';
    }

    toggleBtn.addEventListener('click', () => {
      currentViewAs = currentViewAs === '3D' ? '2D' : '3D';
      toggleBtn.textContent = currentViewAs === '3D' ? 'XY 2D で表示' : '3D で表示';
      render(${data}, currentViewAs);
    });

    function render(coords, viewAs) {
      const fg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-foreground').trim() || '#cccccc';
      const bg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-background').trim() || '#1e1e1e';

      const is3D = viewAs === '3D';

      const trace = {
        type: is3D ? 'scatter3d' : 'scatter',
        mode: 'markers',
        marker: { size: is3D ? 4 : 8, color: '#4dc9f6' },
        name: viewAs + ' (' + coords.length + ' points)',
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
    render(${data}, currentViewAs);

    // Listen for update messages
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'render') {
        currentViewAs = msg.dim;
        toggleBtn.textContent = currentViewAs === '3D' ? 'XY 2D で表示' : '3D で表示';
        toggleBtn.style.display = msg.dim === '3D' ? 'inline-block' : 'none';
        render(msg.coords, msg.dim);
      }
    });
  </script>
</body>
</html>`;
}
