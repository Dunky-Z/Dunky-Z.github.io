---
title: Clang-Format格式化代码
date: 2021-12-01 17:42:45
updated:
tags:
categories: [工欲善其事必先利其器]
---

## 安装
### Linux
```bash
sudo apt-get install clang-format
```

### windows
## 使用
### 入门使用
Linux可以直接命令行，使用以LLVM代码风格格式化`main.cpp`, 结果直接写到`main.cpp`
```bash
clang g-format -i main.cpp -style=LLVM
```
### 进阶配置
如果每次编码都命令行执行一遍那也太麻烦了，而且每次修改也不止一个文件。最好的方式就是每次保存文件时自动格式化。比如VSCode已经内置了`Clang-Format`稍作配置即可实现，接下来介绍几种常见IDE如何配置`Clang-Format`。

#### VSCode
VSCode最常用，因为内置了`Clang-Format`也最容易配置。
- 安装`C/C++`插件，`Ctrl+Shift+X`打开应用商店，搜索`C/C++`找到下图插件，安装后会自动安装`Clang-Format`程序，无需单独下载。默认安装路径为:
`C:\Users\(你的用户名)\.vscode\extensions\ms-vscode.cpptools-1.7.1\LLVM\bin\clang-format.exe`。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012311818.png)
- 打开设置页面（左下角齿轮-设置），搜索`format`，勾选`Format On Save`，每次保存文件时自动格式化文档。下方的设置是决定每次格式化是整个文档，还是做过修改的内容。默认是`file`，对整个文档进行格式化。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012304766.png)
- 仍在设置页面搜索`Clang`，配置如下。`.clang-format`文件最后详解。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012321838.png)
- 效果图
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012327867.gif)

#### QtCreator
#### Eclipse

## 配置简介