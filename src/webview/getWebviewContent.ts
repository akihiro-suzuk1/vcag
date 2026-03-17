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

  const leafletJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "leaflet",
      "dist",
      "leaflet.js"
    )
  );
  const leafletCssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "leaflet",
      "dist",
      "leaflet.css"
    )
  );
  const markerIconUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "leaflet",
      "dist",
      "images",
      "marker-icon.png"
    )
  );
  const markerIcon2xUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "leaflet",
      "dist",
      "images",
      "marker-icon-2x.png"
    )
  );
  const markerShadowUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "node_modules",
      "leaflet",
      "dist",
      "images",
      "marker-shadow.png"
    )
  );

  const nonce = randomBytes(16).toString("hex");

  const data = JSON.stringify(coords);

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${webview.cspSource}; img-src https://tile.openstreetmap.org https://*.tile.openstreetmap.org ${webview.cspSource}; connect-src https://tile.openstreetmap.org https://*.tile.openstreetmap.org;"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coord Graph</title>
  <link rel="stylesheet" href="${leafletCssUri}" />
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
    #map {
      width: 100%;
      height: 90vh;
      display: none;
    }
    #toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    #toggle-dim {
      display: none;
      padding: 4px 12px;
      cursor: pointer;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 2px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    #toggle-dim:hover, #add-clipboard:hover {
      background: var(--vscode-button-hoverBackground);
    }
    #add-clipboard {
      padding: 4px 12px;
      cursor: pointer;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 2px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    #toolbar label {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-editor-foreground);
      cursor: pointer;
      user-select: none;
    }
    #toolbar label input {
      margin-right: 4px;
    }
    #clipboard-confirm {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    #clipboard-confirm-inner {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border, #444);
      border-radius: 4px;
      padding: 16px;
      max-width: 80vw;
      max-height: 60vh;
      overflow: auto;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-editor-foreground);
    }
    #clipboard-preview {
      background: var(--vscode-textCodeBlock-background, #1a1a1a);
      padding: 8px;
      border-radius: 2px;
      max-height: 30vh;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 12px;
    }
    #clipboard-confirm-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: flex-end;
    }
    #clipboard-ok, #clipboard-cancel {
      padding: 4px 16px;
      cursor: pointer;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 2px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    #clipboard-ok {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    #clipboard-cancel {
      background: var(--vscode-button-secondaryBackground, transparent);
      color: var(--vscode-button-secondaryForeground, var(--vscode-editor-foreground));
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <button id="toggle-dim">Show as XY 2D</button>
    <label><input type="checkbox" id="connect-lines" checked /> Connect lines</label>
    <label><input type="checkbox" id="close-loop" /> Close loop</label>
    <label><input type="checkbox" id="swap-xy" /> Swap XY</label>
    <label><input type="checkbox" id="flip-y" /> Flip Y</label>
    <label><input type="checkbox" id="map-mode" /> Map</label>
    <button id="add-clipboard">Add Clipboard Data</button>
  </div>
  <div id="clipboard-confirm" style="display:none;">
    <div id="clipboard-confirm-inner">
      <p>Add this data to the graph?</p>
      <pre id="clipboard-preview"></pre>
      <div id="clipboard-confirm-buttons">
        <button id="clipboard-ok">Add</button>
        <button id="clipboard-cancel">Cancel</button>
      </div>
    </div>
  </div>
  <div id="chart"></div>
  <div id="map"></div>
  <script nonce="${nonce}" src="${plotlyUri}"></script>
  <script nonce="${nonce}" src="${leafletJsUri}"></script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    let currentViewAs = "${dim}";
    const dataDim = "${dim}";
    const toggleBtn = document.getElementById('toggle-dim');
    const connectLinesCb = document.getElementById('connect-lines');
    const closeLoopCb = document.getElementById('close-loop');
    const swapXYCb = document.getElementById('swap-xy');
    const flipYCb = document.getElementById('flip-y');
    const mapModeCb = document.getElementById('map-mode');
    const addClipboardBtn = document.getElementById('add-clipboard');
    const clipboardConfirm = document.getElementById('clipboard-confirm');
    const clipboardPreview = document.getElementById('clipboard-preview');
    const clipboardOk = document.getElementById('clipboard-ok');
    const clipboardCancel = document.getElementById('clipboard-cancel');
    const chartEl = document.getElementById('chart');
    const mapEl = document.getElementById('map');

    let pendingClipboardText = null;

    let connectLines = true;
    let closeLoop = false;
    let swapXY = false;
    let flipY = false;
    let mapMode = false;
    let leafletMap = null;
    let mapMarkers = [];
    let mapPolyline = null;

    const traceColors = ['#4dc9f6','#f67019','#f53794','#537bc4','#acc236','#166a8f','#00a950','#58595b','#8549ba'];
    const datasets = [${data}];

    if (dataDim === '3D') {
      toggleBtn.style.display = 'inline-block';
    }

    toggleBtn.addEventListener('click', () => {
      currentViewAs = currentViewAs === '3D' ? '2D' : '3D';
      toggleBtn.textContent = currentViewAs === '3D' ? 'Show as XY 2D' : 'Show as 3D';
      renderAll(currentViewAs);
    });

    connectLinesCb.addEventListener('change', () => {
      connectLines = connectLinesCb.checked;
      if (!connectLines) {
        closeLoop = false;
        closeLoopCb.checked = false;
        closeLoopCb.disabled = true;
      } else {
        closeLoopCb.disabled = false;
      }
      renderAll(currentViewAs);
    });

    closeLoopCb.addEventListener('change', () => {
      closeLoop = closeLoopCb.checked;
      renderAll(currentViewAs);
    });

    swapXYCb.addEventListener('change', () => {
      swapXY = swapXYCb.checked;
      renderAll(currentViewAs);
    });

    flipYCb.addEventListener('change', () => {
      flipY = flipYCb.checked;
      renderAll(currentViewAs);
    });

    mapModeCb.addEventListener('change', () => {
      mapMode = mapModeCb.checked;
      updateToolbarVisibility();
      renderAll(currentViewAs);
    });

    addClipboardBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'requestClipboardData' });
    });

    clipboardOk.addEventListener('click', () => {
      if (pendingClipboardText !== null) {
        vscode.postMessage({ type: 'confirmClipboardData', text: pendingClipboardText });
        pendingClipboardText = null;
      }
      clipboardConfirm.style.display = 'none';
    });

    clipboardCancel.addEventListener('click', () => {
      pendingClipboardText = null;
      clipboardConfirm.style.display = 'none';
    });

    function updateToolbarVisibility() {
      if (mapMode) {
        toggleBtn.style.display = 'none';
        flipYCb.parentElement.style.display = 'none';
        chartEl.style.display = 'none';
        mapEl.style.display = 'block';
      } else {
        if (dataDim === '3D') {
          toggleBtn.style.display = 'inline-block';
        }
        flipYCb.parentElement.style.display = '';
        chartEl.style.display = 'block';
        mapEl.style.display = 'none';
      }
    }

    function renderAll(viewAs) {
      if (mapMode) {
        const allCoords = datasets.flat();
        const c = swapXY ? allCoords.map(p => [p[1], p[0]].concat(p.slice(2))) : allCoords;
        renderMap(c);
      } else {
        renderPlotlyMulti(datasets, viewAs);
      }
    }

    function renderMap(coords) {
      if (!leafletMap) {
        leafletMap = L.map('map');
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(leafletMap);
      }

      // Fix default icon paths for webview
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: '${markerIconUri}',
        iconRetinaUrl: '${markerIcon2xUri}',
        shadowUrl: '${markerShadowUri}',
      });

      // Clear previous markers and polyline
      mapMarkers.forEach(m => m.remove());
      mapMarkers = [];
      if (mapPolyline) {
        mapPolyline.remove();
        mapPolyline = null;
      }

      if (coords.length === 0) return;

      // Interpret coords as [lat, lng]
      const latLngs = coords.map(c => [c[0], c[1]]);

      latLngs.forEach((ll, i) => {
        const marker = L.marker(ll)
          .addTo(leafletMap)
          .bindPopup('Point ' + i + ': [' + ll[0] + ', ' + ll[1] + ']');
        mapMarkers.push(marker);
      });

      if (connectLines) {
        let lineCoords = latLngs.slice();
        if (closeLoop && lineCoords.length > 0) {
          lineCoords = lineCoords.concat([lineCoords[0]]);
        }
        mapPolyline = L.polyline(lineCoords, { color: '#4dc9f6', weight: 2 }).addTo(leafletMap);
      }

      leafletMap.fitBounds(L.latLngBounds(latLngs));

      setTimeout(() => {
        leafletMap.invalidateSize();
      }, 100);
    }

    function renderPlotlyMulti(allDatasets, viewAs) {
      const fg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-foreground').trim() || '#cccccc';
      const bg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-background').trim() || '#1e1e1e';

      const is3D = viewAs === '3D';

      const traces = allDatasets.map((coords, idx) => {
        const c = swapXY ? coords.map(p => [p[1], p[0]].concat(p.slice(2))) : coords;
        let drawCoords = c;
        if (connectLines && closeLoop && c.length > 0) {
          drawCoords = c.concat([c[0]]);
        }

        const color = traceColors[idx % traceColors.length];
        const label = idx === 0 ? 'Original' : 'Added #' + idx;
        const trace = {
          type: is3D ? 'scatter3d' : 'scatter',
          mode: connectLines ? 'lines+markers' : 'markers',
          marker: { size: is3D ? 4 : 8, color: color },
          name: label + ' (' + coords.length + ' pts)',
          x: drawCoords.map(p => p[0]),
          y: drawCoords.map(p => p[1]),
        };

        if (connectLines) {
          trace.line = { width: 1, color: color };
        }

        if (is3D) {
          trace.z = drawCoords.map(p => p[2]);
        }

        return trace;
      });

      const axisColor = fg + '80';

      const layout = {
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { color: axisColor },
        margin: { l: 50, r: 20, t: 30, b: 50 },
        showlegend: allDatasets.length > 1,
      };

      if (!is3D) {
        layout.xaxis = { title: 'X', gridcolor: fg + '1a', color: axisColor };
        layout.yaxis = { title: 'Y', gridcolor: fg + '1a', color: axisColor, autorange: flipY ? 'reversed' : true };
      } else {
        layout.scene = {
          xaxis: { title: 'X', gridcolor: fg + '1a', color: axisColor },
          yaxis: { title: 'Y', gridcolor: fg + '1a', color: axisColor, autorange: flipY ? 'reversed' : true },
          zaxis: { title: 'Z', gridcolor: fg + '1a', color: axisColor },
        };
      }

      Plotly.react('chart', traces, layout, { responsive: true });
    }

    // Initial render with embedded data
    renderAll(currentViewAs);

    // Listen for update messages
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'render') {
        datasets.length = 0;
        datasets.push(msg.coords);
        currentViewAs = msg.dim;
        toggleBtn.textContent = currentViewAs === '3D' ? 'Show as XY 2D' : 'Show as 3D';
        toggleBtn.style.display = msg.dim === '3D' ? 'inline-block' : 'none';
        renderAll(msg.dim);
      } else if (msg.type === 'clipboardPreview') {
        const preview = msg.text.length > 500 ? msg.text.slice(0, 500) + '...' : msg.text;
        clipboardPreview.textContent = preview;
        pendingClipboardText = msg.text;
        clipboardConfirm.style.display = 'flex';
      } else if (msg.type === 'addCoords') {
        datasets.push(msg.coords);
        renderAll(currentViewAs);
      }
    });
  </script>
</body>
</html>`;
}
