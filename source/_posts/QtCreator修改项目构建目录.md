---
title: QtCreator修改项目构建目录
date: 2021-09-25 19:17:46
tags: [Qt,Bug]
---

## 保留现场

QtCreator构建项目时，会在统计目录新建一个`build-xxx-debug`的目录，如果想要自己修改这个目录的位置，名称，该怎么办。

## 解决方法

仅修改工具（Tool）–>选项(Options)–>构建和运行(Build&Run)中`Default build directory：./%{CurrentBuild:Name}`是不会生效的。

- 将工具–>选项–>构建和运行中`Default build directory`修改为`./%{CurrentBuild:Name}`（改为你想要的目标目录都行）；

- 把QtCreator关闭，把工程目录下后缀名为`.pro.user`的文件删掉；

- 用QtCreator打开工程，会提示你创建构建目录，此时提示的就是你修改后的`Default build directory`中填写的目录；

其中`.pro.user`文件记录了编译器、构建工具链、构建目录、版本…..等工程编译相关信息，想要更换项目的编译环境，得删除这个文件，由QtCreator自动重新创建。

