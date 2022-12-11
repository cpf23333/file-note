import * as vscode from "vscode";
import * as fs from "fs";
import * as Path from "path";
import { defaultFileName, fileName, setFileName } from "../config/index";
import { eventr } from "./eventer";
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
    let txt = noteInstance.getNote(uri.fsPath);
    if (!txt) {
      return {};
    }
    return {
      tooltip: txt,
      propagate: true,
    };
  }
  dispose() {
    this.disposables.forEach((d) => {
      d.dispose();
    });
  }
}
/**
 * 提示提供器实例
 */
let provider: NoteDecorationProvider;
// 这么写是因为更新备注后需要重新生成提示，就把旧的备注提供器删掉
export function createProvider() {
  provider?.dispose?.();
  provider = new NoteDecorationProvider();
  return provider;
}
export function getBasePath(uri: vscode.Uri) {
  return vscode.workspace.getWorkspaceFolder(uri);
}

export let notes: Record<string, any> = {};
export type Obj = Record<string, any>;
export type Item = { children?: Item[]; label?: string; value?: string };
/**
 * 获取备注数据存储的文件名
 */
export function getFileName(): string {
  let customed =
    vscode.workspace.getConfiguration().get("fileNotes.fileName") ||
    defaultFileName;
  if (typeof customed !== "string") {
    customed = String(customed);
  }
  return customed ? String(customed) : defaultFileName;
}
/**
 *
 * @param path
 * @returns
 */
function readFileByPath(path: string) {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }) || "{}");
  }
  return {};
}
function filterData(content: Record<string, any> = {}) {
  for (const key in content) {
    if (Object.prototype.hasOwnProperty.call(content, key)) {
      const one = content[key];
      if (!one || one === "") {
        delete content[key];
      }
    }
  }
}
/**把传入的路径的反斜杠全替换成普通斜杠 */
function transformBackslash(str: string = "") {
  return str.replace(/\\/g, "/");
}
function openedFolers() {
  return vscode.workspace.workspaceFolders?.map((folder) =>
    transformBackslash(folder.uri.fsPath)
  );
}
/**传入一个路径，顺序向上查找有.git文件夹的路径，没有会返回undefined */
function getGitPath(fsPath: string) {
  fsPath = transformBackslash(fsPath);
  while (fsPath) {
    if (fs.existsSync(Path.join(fsPath, ".git"))) {
      return fsPath;
    } else if (openedFolers()?.some((o) => o === fsPath)) {
      return;
    } else {
      let lastIndex = fsPath.lastIndexOf("/");
      if (lastIndex !== -1) {
        fsPath = fsPath.slice(0, lastIndex);
      } else {
        return;
      }
    }
  }
}

function getVscodeConfigPath(fsPath: string) {
  fsPath = transformBackslash(fsPath);

  while (fsPath) {
    if (fs.existsSync(Path.join(fsPath, ".vscode"))) {
      return fsPath;
    } else if (openedFolers()?.some((o) => o === fsPath)) {
      return;
    } else {
      let lastIndex = fsPath.lastIndexOf("/");
      if (lastIndex !== -1) {
        fsPath = fsPath.slice(0, lastIndex);
      } else {
        return;
      }
    }
  }
}

/**传入两个路径，第二个要在第一个内，返回第二个路径在第一个路径内的相对路径 */
function getChildPath(parentPath: string, childPath: string) {
  let path = childPath.replace(parentPath, "");
  if (path.startsWith("/")) {
    return path.slice(1, path.length);
  }
  return path;
}
class Note {
  tree: Item = { children: [], label: "根目录" };
  /**各子文件夹的备注数据 */
  pathNodes: Record<string, Record<string, string>> = {};
  fileName = "";
  constructor() {
    this.fileName = getFileName();
    let ignoreFolderArr = ["node_modules", ".git", "target", "dist"];
    let exclude = ignoreFolderArr.map((o) => `**/${o}/**`).toString();

    vscode.workspace
      .findFiles("**/.vscode/" + this.fileName, exclude)
      .then((uris) => {
        uris.forEach((uri) => {
          let content = readFileByPath(uri.fsPath);
          let projectRoot = Path.resolve(uri.fsPath, "../../");
          projectRoot = transformBackslash(projectRoot);
          this.pathNodes[projectRoot] = content;
        });
        console.log("data", this.pathNodes);
        eventr.emit("findFilesReady");
      });
  }
  /**
   *更新备注数据并将备注写入json
   * @param path 项目地址
   * @param content file-notes.json的内容
   */
  updateAndWrite2JSON(path: string, content: any) {
    this.pathNodes[path] = content;
    let str = JSON.stringify(content, null, "\t");
    let vscodeDirPath = Path.join(path, ".vscode");
    if (!fs.existsSync(vscodeDirPath)) {
      fs.mkdirSync(vscodeDirPath);
    }
    fs.writeFileSync(Path.join(vscodeDirPath, fileName), str, {
      encoding: "utf-8",
      flag: "w+",
    });
  }
  saveNote(fsPath: string, val: string) {
    fsPath = transformBackslash(fsPath);
    let path = getGitPath(fsPath);
    // 该路径在某个git仓库下
    if (path) {
      console.log("gitPath", path);
      let noteData = this.pathNodes[path] || {};
      let relativePath = getChildPath(path, fsPath);
      noteData[relativePath] = val;
      this.updateAndWrite2JSON(path, noteData);
    } else {
      // 尝试获取.vscode文件夹的父级路径，有这个文件夹视为一个项目
      let path = getVscodeConfigPath(fsPath);
      let noteData: Record<string, string> = {};
      if (path) {
        let relativePath = getChildPath(path, fsPath);
        noteData[relativePath] = val;
        this.updateAndWrite2JSON(path, noteData);
      } else {
        // 还找不着，存储至当前文件夹根目录的.vscode文件夹里
        let targetPath = openedFolers()?.find((folderPath) =>
          fsPath.includes(folderPath)
        );
        if (targetPath) {
          let relativePath = getChildPath(targetPath, fsPath);
          noteData[relativePath] = val;
          this.updateAndWrite2JSON(targetPath, noteData);
        }
        // let optinon: vscode.OpenDialogOptions = {
        //   canSelectFiles: false,
        //   canSelectFolders: true,
        //   canSelectMany: false,
        //   title:
        //     "未找到git仓库及vscode配置路径，请指定备注存储至哪个文件夹的.vscode文件夹中",
        // };
        // vscode.window.showOpenDialog(optinon).then((uris) => {
        //   if (uris) {
        //     let uri = uris[0];
        //     console.log("选中的", uris[0]);
        //   } else {
        //     vscode.window.showErrorMessage("未选择保存路径，备注存储失败");
        //   }
        // });
      }
    }

    return;
  }
  getNote(fsPath: string) {
    fsPath = transformBackslash(fsPath);
    for (const path in this.pathNodes) {
      if (Object.prototype.hasOwnProperty.call(this.pathNodes, path)) {
        if (fsPath.includes(path)) {
          const obj = this.pathNodes[path];
          let relativePath = getChildPath(path, fsPath);
          let res = obj[relativePath];
          return res;
        }
      }
    }
    return "";
  }
}

export let noteInstance = new Note();

/**初始化 */
export function init(content: vscode.ExtensionContext) {
  setFileName(
    vscode.workspace.getConfiguration().get("fileNotes.fileName") ||
      defaultFileName
  );
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
  let url = Path.join(settingJsonPath, ".vscode");
  if (fs.existsSync(Path.join(url, newfileName))) {
    // vscode.window.showInformationMessage("文件已存在");
    // return;
    let fileNotes =
      JSON.parse(
        fs.readFileSync(Path.join(url, newfileName), { encoding: "utf-8" })
      ) || {};
    if (fileNotes instanceof Object) {
      Object.assign(notes, fileNotes);
    }
  }

  fs.writeFileSync(
    Path.join(url, newfileName),
    JSON.stringify(notes, null, "\t")
  );
  vscode.window
    .showInformationMessage("迁移完成，是否删除旧配置？", "是", "否")
    .then((res) => {
      if (res === "是") {
        fs.unlinkSync(Path.join(url, fileName));
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
        defaultFileName;
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
