import * as vscode from "vscode";
import { noteObj, obj } from "./utils";
export class entryItem extends vscode.TreeItem {}
export class EntryList implements vscode.TreeDataProvider<entryItem> {
  onDidChangeTreeData?:
    | vscode.Event<void | entryItem | null | undefined>
    | undefined;
  getTreeItem(element: entryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    console.log("1111");
    return element;
  }
  getChildren(element?: entryItem): vscode.ProviderResult<entryItem[]> {
    if (element) {
      let child = [];
      return [1, 2, 3].map((one) => new entryItem(one.toString()));
    } else {
      let list = [];
      let note: obj = noteObj.tree;
      note = {
        "/src": "111111",
      };
      console.log("tree", note);
      vscode.window.showInformationMessage(JSON.stringify(note));
      for (const key in note) {
        if (Object.prototype.hasOwnProperty.call(note, key)) {
          const val = note[key];
          list.push(key);
        }
      }
      return list.map(
        (one) =>
          new entryItem(one + (note[one] ? "`" + note[one] + "`" : ""), 0)
      );
    }
  }
}

export function setTree() {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  //   vscode.window.registerTreeDataProvider("file-note-explorer",);
}
export function barRegister() {
  let bar = new EntryList();
  vscode.window.registerTreeDataProvider("files1", bar);
  // vscode.commands.registerCommand("")
}
