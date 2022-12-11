# file-notes README

这是一个给文件及文件夹设置备注的插件

## Features

给文件及文件夹设置备注，显示在 title 当中，
备注数据存储在.vscode/file-notes.json 中，后续应该会提供设置指定文件位置
![](https://github.com/cpf23333/file-note/raw/master/images/setting.png)

![](https://github.com/cpf23333/file-note/raw/master/images/noteScreen.png)

![](https://github.com/cpf23333/file-note/raw/master/images/longNoteScreen.png)

## Extension Settings

暂无，后续可能会有将备注存储在本地或指定文件的功能

## Known Issues

如果文件夹内包含未提交的文件或其中有文件存在错误，提示会被 <b>包含强调项</b> 字样覆盖，暂时没有找到解决办法

手动更改 file-notes.json 需重启 vscode 才能生效

## Release Notes

现在插件加载时不会自动创建存储文件了，设置备注时没有对应文件才会创建，新增设置备注json文件名的功能

若 json 中某路径无对应提示信息，会在下一次设置或更新备注后从 json 中移除


**Note:**

这是我写的第一个插件，vscode 的 api 都不咋熟，欢迎提 issue 和 pr
https://github.com/cpf23333/file-note

**Enjoy!**
