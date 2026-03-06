import * as vscode from "vscode";
import { extractCoordinates } from "./extractCoordinates";
import { getWebviewContent } from "./webview/getWebviewContent";

let panel: vscode.WebviewPanel | undefined;

function showGraph(
  context: vscode.ExtensionContext,
  coords: number[][],
  dim: "2D" | "3D"
) {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside);
  } else {
    panel = vscode.window.createWebviewPanel(
      "coordGraph",
      "Coord Graph",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "node_modules"),
        ],
      }
    );
    panel.onDidDispose(() => {
      panel = undefined;
    });
  }

  panel.webview.html = getWebviewContent(
    panel.webview,
    context.extensionUri,
    coords,
    dim
  );
  panel.webview.postMessage({ type: "render", coords, dim });
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "coordGraph.showFromSelection",
      () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("No active editor");
          return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (!text) {
          vscode.window.showWarningMessage("No text selected");
          return;
        }

        const coords = extractCoordinates(text);
        if (coords.length === 0) {
          vscode.window.showWarningMessage("No coordinates found");
          return;
        }

        const dim = coords[0].length === 3 ? "3D" : "2D";
        showGraph(context, coords, dim);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "coordGraph.showFromClipboard",
      async () => {
        const text = await vscode.env.clipboard.readText();
        if (!text) {
          vscode.window.showWarningMessage("Clipboard is empty");
          return;
        }

        const coords = extractCoordinates(text);
        if (coords.length === 0) {
          vscode.window.showWarningMessage("No coordinates found in clipboard");
          return;
        }

        const dim = coords[0].length === 3 ? "3D" : "2D";
        showGraph(context, coords, dim);
      }
    )
  );
}

export function deactivate() {}
