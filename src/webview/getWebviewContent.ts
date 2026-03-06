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
    #toggle-dim:hover {
      background: var(--vscode-button-hoverBackground);
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
    const chartEl = document.getElementById('chart');
    const mapEl = document.getElementById('map');

    let connectLines = true;
    let closeLoop = false;
    let swapXY = false;
    let flipY = false;
    let mapMode = false;
    let leafletMap = null;
    let mapMarkers = [];
    let mapPolyline = null;

    if (dataDim === '3D') {
      toggleBtn.style.display = 'inline-block';
    }

    toggleBtn.addEventListener('click', () => {
      currentViewAs = currentViewAs === '3D' ? '2D' : '3D';
      toggleBtn.textContent = currentViewAs === '3D' ? 'Show as XY 2D' : 'Show as 3D';
      render(${data}, currentViewAs);
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
      render(${data}, currentViewAs);
    });

    closeLoopCb.addEventListener('change', () => {
      closeLoop = closeLoopCb.checked;
      render(${data}, currentViewAs);
    });

    swapXYCb.addEventListener('change', () => {
      swapXY = swapXYCb.checked;
      render(${data}, currentViewAs);
    });

    flipYCb.addEventListener('change', () => {
      flipY = flipYCb.checked;
      render(${data}, currentViewAs);
    });

    mapModeCb.addEventListener('change', () => {
      mapMode = mapModeCb.checked;
      updateToolbarVisibility();
      render(${data}, currentViewAs);
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

    function render(coords, viewAs) {
      const c = swapXY ? coords.map(p => [p[1], p[0]].concat(p.slice(2))) : coords;
      if (mapMode) {
        renderMap(c);
      } else {
        renderPlotly(c, viewAs);
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

    function renderPlotly(coords, viewAs) {
      const fg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-foreground').trim() || '#cccccc';
      const bg = getComputedStyle(document.body)
        .getPropertyValue('--vscode-editor-background').trim() || '#1e1e1e';

      const is3D = viewAs === '3D';

      let drawCoords = coords;
      if (connectLines && closeLoop && coords.length > 0) {
        drawCoords = coords.concat([coords[0]]);
      }

      const trace = {
        type: is3D ? 'scatter3d' : 'scatter',
        mode: connectLines ? 'lines+markers' : 'markers',
        marker: { size: is3D ? 4 : 8, color: '#4dc9f6' },
        name: viewAs + ' (' + coords.length + ' points)',
        x: drawCoords.map(c => c[0]),
        y: drawCoords.map(c => c[1]),
      };

      if (connectLines) {
        trace.line = { width: 1, color: '#4dc9f6' };
      }

      if (is3D) {
        trace.z = drawCoords.map(c => c[2]);
      }

      const axisColor = fg + '80';

      const layout = {
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { color: axisColor },
        margin: { l: 50, r: 20, t: 30, b: 50 },
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

      Plotly.react('chart', [trace], layout, { responsive: true });
    }

    // Initial render with embedded data
    render(${data}, currentViewAs);

    // Listen for update messages
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'render') {
        currentViewAs = msg.dim;
        toggleBtn.textContent = currentViewAs === '3D' ? 'Show as XY 2D' : 'Show as 3D';
        toggleBtn.style.display = msg.dim === '3D' ? 'inline-block' : 'none';
        render(msg.coords, msg.dim);
      }
    });
  </script>
</body>
</html>`;
}
