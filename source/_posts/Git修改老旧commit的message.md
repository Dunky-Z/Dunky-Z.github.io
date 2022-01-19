---
title: Git修改老旧commit的message
date: 2021-11-22 22:50:25
updated:
tags: [Git]
categories: [Git实战]
---

**以下操作仅限于维护自己的分支，不建议对团队共享的代码进行修改。**

以最近三次提交为例，假设想要修改第二个提交的`message`。可以使用`git rebase`命令
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222255230.png)

```
git rebase -i 27d2f
```
- `-i`交互式变基
- `27d2f`需要改变`message`的提交的父节点

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222258390.png)

弹出页面可以使用提供的命令进行操作，比如`pick`意思就是挑选需要的`commit`。本次任务需要修改`message`，从下方帮助文档里可以找到`reword`命令，可以保留`commit`，只修改`message`。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222301367.png)

保存退出后，会弹出另外一个界面。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222302032.png)

在这里就可以真正修改需要更新的`message`。保存退出即可。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111222303965.png)
