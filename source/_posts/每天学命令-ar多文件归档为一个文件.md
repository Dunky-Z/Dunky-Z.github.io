---
title: 每天学命令-ar多文件归档为一个文件
date: 2021-08-10 11:33:49
tags: [每天学命令, Linux]
---

现在我们有`solution.c`,`solution.h`两个文件，他们实现了某一个功能，自成一个模块。在其他项目中也可复用。我们就可以把它做成库文件。`ar`命令就可以将锁哥文件整合成一个库文件，也可以从一个库中单独提取出某一个文件。
## Commands
```
-d 　删除备存文件中的成员文件。
-m 　变更成员文件在备存文件中的次序。
-p 　显示备存文件中的成员文件内容。
-q 　将文件附加在备存文件末端。
-r 　将文件插入备存文件中。
-t 　显示备存文件中所包含的文件。
-x 　自备存文件中取出成员文件。
```

## Examples
### 打包文件
将`solution.c solution.h`两个文件打包成`solution.bak`，并显示详细信息
```
➜  ar rv solution.bak solution.c solution.h
ar: 正在创建 solution.bak
a - solution.c
a - solution.h
```
### 显示打包文件内容
```
➜  ar t solution.bak 
solution.c
solution.h
```