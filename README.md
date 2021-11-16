# file-notes README

这是一个给文件及文件夹设置备注的插件

## Features

给文件及文件夹设置备注，显示在 title 当中，
备注数据存储在.vscode/file-note.json 中，后续应该会提供设置指定文件位置
![](https://s3.bmp.ovh/imgs/2021/11/d5973b81fe9a6d61.png)

![](https://s3.bmp.ovh/imgs/2021/11/319f3fc844a21705.png)

![](https://s3.bmp.ovh/imgs/2021/11/1c10d3074eab0532.png)

## Extension Settings

暂无，后续可能会有将备注存储在本地或指定文件的功能

## Known Issues

如果文件夹内包含未提交的文件或其中有文件存在错误，提示会被 <b>包含强调项</b> 字样覆盖，暂时没有找到解决办法

手动更改 file-note.json 需重启 vscode 才能生效

## Release Notes

若 json 中某路径无对应提示信息，会在下一次设置或更新备注后从 json 中移除

initial Release

**Note:**

这是我写的第一个插件，vscode 的 api 都不咋熟，欢迎提 issue 和 pr
https://gitee.com/cpf23333/file-note

**Enjoy!**
