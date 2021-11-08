import * as vscode from "vscode";
export function getBasePath(uri: vscode.Uri) {
  return vscode.workspace.getWorkspaceFolder(uri);
}
export function getRelativePath(pathUri: vscode.Uri): string {
  let basepath = getBasePath(pathUri)?.uri.fsPath || "";
  let path = pathUri.fsPath;
  return path.replace(basepath, "");
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
}
export function getNote(key: string) {
  return notes[key];
}
