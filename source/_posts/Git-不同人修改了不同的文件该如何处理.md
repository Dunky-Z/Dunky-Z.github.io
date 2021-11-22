---
title: Git-不同人修改了不同的文件该如何处理
date: 2021-09-12 23:19:28
updated:
tags: [Git]
categories: [Git实战]
---
## 需求
同一个项目，**不同的开发者修改了不同的文件**，如何解决同步冲突。

## 方法

第一个用户新建一个分支，
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222312698.png)

以上命令就是新建一个分支`feature/add_git_commands` 将其与远端分支`origin/feature/add_git_commands`相关联，并切换到该分支。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222317370.png)

修改readme文件，并推送到远端。因为新建分支时已经做了与远端关联，所以可以直接`git push`。

