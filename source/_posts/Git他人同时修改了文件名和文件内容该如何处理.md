---
title: Git他人同时修改了文件名和文件内容该如何处理
date: 2021-11-27 23:07:37
updated:
tags: [Git]
categories: [Git实战]
---

用户一修改了文件名，并提交远端。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272319842.png)

用户二修改了文件内容，也进行了推送，
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272320474.png)

当然会被无情拒绝，
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272321244.png)

解决这个问题也十分简单，Git可以智能的感知到只是文件名被修改，只需要一个`git pull`命令就可以解决。弹出弹窗可以直接保存退出，默认不变就行。

