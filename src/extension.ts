// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { barRegister } from "./utils/tree";
import {
  createProvider,
  getNote,
  getRelativePath,
  init,
  saveNote,
  settingChangeWatcher,
} from "./utils/utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let provider = createProvider();
  init(context);
  context.subscriptions.push(settingChangeWatcher());
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
        .then((txt: any) => {
          if (typeof txt === "undefined") {
            return;
          }
          saveNote(relativePath, txt);
          provider.dispose();
          provider = createProvider();
          provider.provideFileDecoration(uri);
        });
    }
  );
  context.subscriptions.push(setNote);
  barRegister();
}

// this method is called when your extension is deactivated
export function deactivate() {}
