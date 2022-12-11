import * as vscode from "vscode";
import { Item, noteInstance } from "./utils";
export class EntryItem extends vscode.TreeItem {
  constructor(
    label: string | vscode.TreeItemLabel,
    state: vscode.TreeItemCollapsibleState,
    desc?: string
  ) {
    super(label, state);
    this.description = desc;
    this.tooltip = desc;
  }
}
function getTargetByLabel(
  tree: Item | Item[],
  label: string
): Item | undefined {
  let stack: Item[] = [];
  stack = stack.concat(tree);
  while (stack.length) {
    let temp = stack.shift();
    if (temp?.children) {
      stack = stack.concat(temp.children);
    }
    if (temp?.label === label) {
      return temp;
    }
  }
}
export class EntryList implements vscode.TreeDataProvider<EntryItem> {
  /**生成{@link vscode.TreeItem `TreeItem`} 需要的参数*/
  getEntryItemConfig(
    obj: Item
  ): [string, vscode.TreeItemCollapsibleState, string] {
    let label = obj.label || "";
    let value = obj.value || "";
    return [
      label,
      obj.children?.length
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      value,
    ];
  }
  getEntryItems(objOrArray: Item | Item[]): vscode.TreeItem[] {
    if (Array.isArray(objOrArray)) {
      return objOrArray.map((one) => this.getEntryItems(one)).flat();
    } else {
      let [label, state, desc] = this.getEntryItemConfig(objOrArray);
      return [new EntryItem(label, state, desc)];
    }
  }
  onDidChangeTreeData?:
    | vscode.Event<void | EntryItem | null | undefined>
    | undefined;
  getTreeItem(element: EntryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: Item): Thenable<EntryItem[] | any | undefined> {
    let note: Item = noteInstance.tree;
    if (element) {
      let target = getTargetByLabel(note, String(element.label));
      return Promise.resolve(this.getEntryItems(target?.children || []));
    } else {
      let res = this.getEntryItems(note);
      return Promise.resolve(res);
    }
  }
}
export function barRegister() {
  let bar = new EntryList();
  vscode.window.registerTreeDataProvider("files1", bar);
  // vscode.commands.registerCommand("")
}
