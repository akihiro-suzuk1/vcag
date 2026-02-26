import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "vcag" is now active!');

  const disposable = vscode.commands.registerCommand("vcag.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from VCAG!");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
