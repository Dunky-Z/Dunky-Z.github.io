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
#### QtCreator
#### Eclipse

## 配置简介