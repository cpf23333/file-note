// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getNote, getRelativePath, init, saveNote } from "./utils/utils";
class CountDecorationProvider {
  public disposables;
  constructor() {
    this.disposables = [];
    this.disposables.push(vscode.window.registerFileDecorationProvider(this));
  }
  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration {
    let relativePath = getRelativePath(uri);
    // console.log(relativePath);
    let txt = getNote(relativePath);
    if (!txt) {
      return {};
    }
    return {
      tooltip: txt,
    };
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  init();
  let setNote = vscode.commands.registerCommand(
    "file-notes.setNote",
    (uri: vscode.Uri) => {
      vscode.window
        .showInputBox({ title: "请输入本文件夹的备注" })
        .then((txt = "") => {
          let relativePath = getRelativePath(uri);
          saveNote(relativePath, txt);
          let provider = new CountDecorationProvider();
          provider.provideFileDecoration(uri);
        });
    }
  );
  context.subscriptions.push(setNote);

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "file-notes" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "file-notes.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from file Note!");
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
