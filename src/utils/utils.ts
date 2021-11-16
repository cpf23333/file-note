import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
/**
 * 备注提示注册器
 */
export class NoteDecorationProvider {
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
      propagate: true,
    };
  }
  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
let provider;
export function createProvider() {
  provider = new NoteDecorationProvider();
  return provider;
}
export function getBasePath(uri: vscode.Uri) {
  return vscode.workspace.getWorkspaceFolder(uri);
}
export function getRelativePath(pathUri: vscode.Uri): string {
  let basePath = getBasePath(pathUri)?.uri.fsPath || "";
  basePath = basePath.slice(0, basePath.length);
  let path = pathUri.fsPath;
  return path.replace(basePath, "").replace(/\\/g, "/");
}

export let notes: any = {};
let note2Add: string | undefined = undefined;
export function setTempNote(txt: string | undefined) {
  note2Add = txt;
}
export function getTempNote() {
  return note2Add;
}
export function saveNote(key: string, val: string) {
  notes[key] = val;
  save2JSON();
}
export function getNote(key: string) {
  return notes[key];
}
/**初始化 */
export function init() {
  // 如果插件所属的工作区不存在储存路径，则创建一个
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode").replace(/\\/g, "/");
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url);
  }
  // 将文件写入储存目录
  if (!fs.existsSync(path.join(url, "file-notes.json"))) {
    fs.writeFileSync(path.join(url, "file-notes.json"), "{}");
    notes = {};
  } else {
    let jsonPath = path.join(url, "file-notes.json");
    let content = JSON.parse(
      fs.readFileSync(jsonPath, {
        encoding: "utf-8",
      }) || "{}"
    );
    for (const key in content) {
      if (Object.prototype.hasOwnProperty.call(content, key)) {
        const one = content[key];
        if (!one || one === "") {
          delete content[key];
        }
      }
    }
    notes = content || {};
  }
}
export function save2JSON() {
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode");
  fs.writeFileSync(
    path.join(url, "file-notes.json"),
    JSON.stringify(notes, null, "\t")
  );
}
