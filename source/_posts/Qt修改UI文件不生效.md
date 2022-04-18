---
title: Qt修改UI文件不生效
date: 2021-09-26 09:19:18
tags: [Qt,Bug]
---
## 保留现场

修改了UI文件后，在代码中无法调用新增的内容。

## 探究原因

导致`ui_*.h`文件没有更新的原因是源代码中`#include ui_*.h`的位置和实际生成的位置不同，引用的是老的`ui_*.h`

## 解决方法

方法一：

项目设置文件`.pro`内增加 `UI_DIR=./UI`，同时删除掉源代码目录中`ui_*.h`，`clear all`,`->qmake->rebuilt all`
方法二：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210926105252.png)

