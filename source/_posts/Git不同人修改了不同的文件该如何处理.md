---
title: Git不同人修改了不同的文件该如何处理
date: 2021-09-12 23:19:28
updated:
tags: [Git]
categories: [Git实战]
---
## 需求
同一个项目，**不同的开发者修改了不同的文件**，如何解决同步冲突。

## 模拟

### 用户一修改
第一个用户新建一个分支，
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111222312698.png)

以上命令就是新建一个分支`feature/add_git_commands` 将其与远端分支`origin/feature/add_git_commands`相关联，并切换到该分支。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111222317370.png)

修改readme文件，并推送到远端。因为新建分支时已经做了与远端关联，所以可以直接`git push`。

### 用户二修改
第二个用户，首先拉取远端分支。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111232232495.png)

`git branch -v`查看本地分支，保持不变，但是`git branch -av`查看所有分支，可以发现多了两个远端分支。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111232233342.png)

新建本地分支，保持与远端分支名相同。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111232235005.png)

此时再对与readme不同的文件进行修改，提交，推送都会比较顺利。因为当前分支保持`fast forward`。

用户二继续做开发，但是没再往远端推送代码。在此期间，用户一对远端代码进行了更新。用户二想再次推送代码，将会报错，提示当前提交不再`fast forward`。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111232242069.png)

## 解决方法
- `git fetch`远端分支
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111232243841.png)

- `git merge`合并远端分支
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202111232245751.png)

因为两个用户修改的不同文件，所以合并不会产生冲突。