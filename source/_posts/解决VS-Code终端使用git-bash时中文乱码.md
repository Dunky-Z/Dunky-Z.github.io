---
title: 解决VS Code终端使用git bash时中文乱码
date: 2022-07-16 21:59:50
updated:
tags: [VSCode,Bug]
categories: [Bug踩坑记录]
---

## 保留现场

Windows环境下，使用VSCode的终端时，中文显示为乱码，如使用`git status`命令查看修改文件时，中文文件名就无法正常显示：
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207162158602.png)

## 探究原因
因为终端被替换成了 `git bash`，它对所有非英文的字符进行了转义。

[官方文档提到](https://git-scm.com/docs/git-config#Documentation/git-config.txt-corequotePath)：

输出路径的命令（例如` ls-files`、`diff`）将通过将路径名括在双引号中并以与 C 转义控制字符相同的方式用反斜杠转义这些字符来引用路径名中的异常字符（例如` \t `用于 `TAB `, `\n` 表示` LF`，`\\ `表示反斜杠）或值大于 `0x80` 的字节（例如，八进制 `\302\265` 表示 UTF-8 中的“micro”）。如果此变量设置为 `false`，则高于 `0x80` 的字节不再被视为异常。无论此变量的设置如何，双引号、反斜杠和控制字符总是被转义。一个简单的空格字符不被认为是异常的。许多命令可以使用 `-z` 选项完全逐字输出路径名。默认值是true。
## 解决方法

命令行输入，取消转义：
```bash
git config --global core.quotepath false
```
