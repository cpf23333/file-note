// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getNote, getRelativePath, init, saveNote } from "./utils/utils";
/**
 * 备注提示注册器
 */
class NoteDecorationProvider {
  public disposables;
  constructor() {
    this.disposables = [];
    this.disposables.push(vscode.window.registerFileDecorationProvider(this));
  }
  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration {
    let relativePath = getRelativePath(uri);
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
  let provider = new NoteDecorationProvider();
  let setNote = vscode.commands.registerCommand(
    "file-notes.setNote",
    (uri: vscode.Uri) => {
      if (!uri) {
        return vscode.window.showErrorMessage(
          "请从资源管理器右键，点击设置备注使用此功能"
        );
      }
      let relativePath = getRelativePath(uri);
      let val = getNote(relativePath);
      provider.provideFileDecoration(uri);
      vscode.window
        .showInputBox({ title: "请输入本文件或文件夹的备注", value: val })
        .then((txt = "") => {
          saveNote(relativePath, txt);
        });
    }
  );
  context.subscriptions.push(setNote);
}

// this method is called when your extension is deactivated
export function deactivate() {}
