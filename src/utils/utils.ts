import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { defaultFileName, fileName, setFileName } from "../config/index";
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
/**
 * 提示提供器实例
 */
let provider: NoteDecorationProvider;
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

export let notes: Record<string, any> = {};
export type Obj = Record<string, any>;
export type Item = { children?: Item[]; label?: string; value?: string };
class Note {
  notes: Obj = {};
  tree: Item = { children: [], label: "根目录" };
  fileName = "";
  constructor() {
    this.fileName =
      vscode.workspace.getConfiguration().get("fileNotes.fileName") ||
      "file-note.json";
    let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
      .fsPath;
    let url = path.join(settingJsonPath, ".vscode").replace(/\\/g, "/");
    if (!fs.existsSync(path.join(url, this.fileName))) {
      this.notes = {};
    } else {
      let jsonPath = path.join(url, this.fileName);
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
      this.notes = content || {};
    }
    this.setTree();
  }
  private save2JSON() {
    let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
      .fsPath;
    let url = path.join(settingJsonPath, ".vscode");
    if (!fs.existsSync(url)) {
      fs.mkdirSync(url);
    }
    if (!fs.existsSync(path.join(url, fileName))) {
      fs.writeFileSync(path.join(url, fileName), "{}");
    }
    fs.writeFileSync(
      path.join(url, fileName),
      JSON.stringify(this.notes, null, "\t")
    );
  }
  private setItem(key: string, val: string) {
    let keys = key.split("/").filter((one) => one);
    let temp: Item = this.tree;
    keys.forEach((label, i) => {
      let t = temp?.children?.find((one) => one.label === label) || undefined;
      let newData: Item = { children: [], label };
      if (t) {
        temp = t;
        newData = t;
      } else {
        if (!temp.children) {
          temp.children = [];
        }
        temp?.children?.push(newData);
      }
      if (i === keys.length - 1) {
        newData.value = val;
        newData.children = undefined;
      }
      temp = newData;
    });
  }
  private setTree() {
    let data = this.notes;
    try {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const val = data[key];
          this.setItem(key, val);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  updateData(key: string, val: string) {
    this.notes[key] = val;
    this.save2JSON();
    this.setTree();
  }
}
console.log("开始实例化");

export let noteObj = new Note();
console.log("note", noteObj);

export function saveNote(key: string, val: string) {
  notes[key] = val;
  save2JSON();
}
export function getNote(key: string) {
  return notes[key];
}
/**初始化 */
export function init(content: vscode.ExtensionContext) {
  setFileName(vscode.workspace.getConfiguration().get("fileNotes.fileName"));
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode").replace(/\\/g, "/");
  if (!fs.existsSync(path.join(url, fileName))) {
    notes = {};
  } else {
    let jsonPath = path.join(url, fileName);
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
    console.log("notes数据", notes);
  }
}
export function save2JSON() {
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode");
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url);
  }
  if (!fs.existsSync(path.join(url, fileName))) {
    fs.writeFileSync(path.join(url, fileName), "{}");
  }
  fs.writeFileSync(path.join(url, fileName), JSON.stringify(notes, null, "\t"));
}
/**
 * 迁移备注至新文件
 */
export function migrate() {
  vscode.window.showInformationMessage("开始迁移");
  let newfileName: string =
    vscode.workspace.getConfiguration().get("fileNotes.fileName") ||
    defaultFileName;
  if (!newfileName.endsWith(".json")) {
    newfileName = newfileName + ".json";
  }
  if (newfileName === fileName) {
    return;
  }
  let settingJsonPath = (vscode.workspace.workspaceFolders || [])[0]?.uri
    .fsPath;
  let url = path.join(settingJsonPath, ".vscode");
  if (fs.existsSync(path.join(url, newfileName))) {
    // vscode.window.showInformationMessage("文件已存在");
    // return;
    let fileNotes =
      JSON.parse(
        fs.readFileSync(path.join(url, newfileName), { encoding: "utf-8" })
      ) || {};
    if (fileNotes instanceof Object) {
      Object.assign(notes, fileNotes);
    }
  }

  fs.writeFileSync(
    path.join(url, newfileName),
    JSON.stringify(notes, null, "\t")
  );
  vscode.window
    .showInformationMessage("迁移完成，是否删除旧配置？", "是", "否")
    .then((res) => {
      if (res === "是") {
        fs.unlinkSync(path.join(url, fileName));
      }
      setFileName(newfileName);
      provider.dispose();
      createProvider();
    });
}
/**生成一个设置监听器 */
export function settingChangeWatcher() {
  return vscode.workspace.onDidChangeConfiguration(() => {
    debounce(() => {
      let newSettings: string =
        vscode.workspace.getConfiguration().get("fileNotes.fileName") ||
        "file-notes.json";
      if (!newSettings.endsWith(".json")) {
        newSettings = newSettings + ".json";
      }
      if (newSettings !== fileName) {
        vscode.window
          .showInformationMessage(
            "文件名已更新，是否将旧备注迁移至新文件中？",
            "是",
            "否"
          )
          .then((res) => {
            if (res === "是") {
              migrate();
            }
          });
      }
    }, 500)();
  });
}
function debounce(func: Function, wait: number, immediate?: boolean) {
  let timer: NodeJS.Timeout | null;
  return function (this: unknown, ...args: any[]) {
    let context = this;
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate) {
      var callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      if (callNow) {
        func.apply(context, args);
      }
    } else {
      timer = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
  };
}
