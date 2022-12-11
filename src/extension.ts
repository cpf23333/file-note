// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { eventr } from "./utils/eventer";
import {
  createProvider,
  init,
  noteInstance,
  // settingChangeWatcher,
} from "./utils/utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  init(context);
  eventr.once("findFilesReady", () => {
    let provider = createProvider();
    // context.subscriptions.push(settingChangeWatcher());
    let setNote = vscode.commands.registerCommand(
      "file-notes.setNote",
      (uri?: vscode.Uri) => {
        if (!uri) {
          return vscode.window.showErrorMessage(
            "请从资源管理器右键，点击设置备注使用此功能"
          );
        }
        let val = noteInstance.getNote(uri.fsPath);
        provider.provideFileDecoration(uri);
        vscode.window
          .showInputBox({ title: "请输入本文件或文件夹的备注", value: val })
          .then((txt: any) => {
            if (typeof txt === "undefined") {
              return;
            }
            noteInstance.saveNote(uri.fsPath, txt);
            provider.dispose();
            provider = createProvider();
            provider.provideFileDecoration(uri);
          });
      }
    );
    context.subscriptions.push(setNote);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
