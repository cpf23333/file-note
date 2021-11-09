import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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
    fs.writeFileSync(path.join(url, "file-notes.json"), JSON.stringify({}));
    notes = {};
  } else {
    let jsonPath = path.join(url, "file-notes.json");
    let content =
      fs.readFileSync(jsonPath, {
        encoding: "utf-8",
      }) || "{}";
    notes = JSON.parse(content) || {};
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
