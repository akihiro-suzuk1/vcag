import * as vscode from "vscode";
import { extractCoordinates } from "./extractCoordinates";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "coordGraph.showFromSelection",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("アクティブなエディタがありません");
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      if (!text) {
        vscode.window.showWarningMessage("テキストが選択されていません");
        return;
      }

      const coords = extractCoordinates(text);
      if (coords.length === 0) {
        vscode.window.showWarningMessage("座標が見つかりませんでした");
        return;
      }

      const dim = coords[0].length === 3 ? "3D" : "2D";
      const preview = coords
        .slice(0, 5)
        .map((c) => `(${c.join(", ")})`)
        .join("  ");
      const suffix = coords.length > 5 ? ` ... 他${coords.length - 5}点` : "";

      vscode.window.showInformationMessage(
        `${dim} 座標 ${coords.length}点: ${preview}${suffix}`
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
