/**默认的文件名 */
export let defaultFileName = "file-notes.json";
/**数据存储文件名 */
export let fileName = "";
/**设置数据存储文件名 */
export function setFileName(name: string = defaultFileName) {
  fileName = name;
}
