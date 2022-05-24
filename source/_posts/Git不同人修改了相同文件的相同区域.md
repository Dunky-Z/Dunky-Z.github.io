---
title: Git不同人修改了相同文件的相同区域
date: 2021-11-27 22:13:28
updated:
tags: [Git]
categories: [Git实战]
---

不同人修改了文件的相同区域，如果向远端推送，肯定会被拒绝。这时候就需要解决冲突，

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272217729.png)

首先拉取远端最新的代码，会提示有冲突的文件，
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272220539.png)

打开冲突的文件，git会对冲突区域进行标记，`<<<<<<`到`======`区域表示远端的代码。`======`到`>>>>>>>`表示本地的代码。这时候就需要自己来判断需要哪些代码，也可以增删一些内容，修改完成后将这些标识符号删除，然后保存退出。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272221887.png)

`git status`查看当前状态，提示还有未合并的路径，需要进行`commit`操作。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272256325.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111272256627.png)

及时`git push`当前代码。