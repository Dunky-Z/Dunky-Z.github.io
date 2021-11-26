---
title: Linux文件删除仍然在Trash目录下占用空间，该如何删除Trash下的文件
date: 2021-11-25 10:31:27
updated:
tags:
categories:
---
## 保留现场


## 探究原因



大意就是，你删除了属于你的文件夹，但其中包含属于另一个用户的文件时，文件可能会卡住，就会在Trash目录里不会被彻底删除。

## 解决方法



```bash
sudo rm -rv /home/<your_username>/.local/share/Trash/expunged/*
```



PS：发现一个好用的磁盘分析工具，Linux内置应用`Disk Usage Analyzer`。按`Win`键后搜索框搜索即可打开。

图形化的方式快速找到占用空间较大的目录，文件。可以右击直接删除。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211125102946.png)