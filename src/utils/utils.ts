import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function getBasePath(uri: vscode.Uri) {
  return vscode.workspace.getWorkspaceFolder(uri);
}
export function getRelativePath(pathUri: vscode.Uri): string {
  let basePath = getBasePath(pathUri)?.uri.fsPath || "";
  basePath = basePath.slice(0, basePath.length - 1);
  let path = pathUri.fsPath;
  return path.replace(basePath, "").replace(/\\/g, "");
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
  console.log("初始化");
  // 如果插件所属的工作区不存在储存路径，则创建一个
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode");
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url);
  }
  // 将文件写入储存目录
  if (!fs.existsSync(path.join(url, "file-notes.json"))) {
    fs.writeFileSync(path.join(url, "file-notes.json"), JSON.stringify({}));
    notes = {};
  } else {
    let content = fs.readFileSync(path.join(url, "file-notes.json"), {
      encoding: "utf-8",
    });
    notes = content || {};
    console.log("还原数据", notes);
  }
}
export function save2JSON() {
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode");
  fs.writeFileSync(path.join(url, "file-notes.json"), JSON.stringify(notes));
}
