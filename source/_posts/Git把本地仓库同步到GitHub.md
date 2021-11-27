---
title: Git-把本地仓库同步到GitHub
date: 2021-09-23 23:06:28
tags: [Git]
categories: [Git实战]
---

## 需求
因为现在大部分情况下是先从远程Clone下来代码，所以这一功能用的不多。但是如果自己想把本地已有的代码同步到远程，本文就可以解决这一的需求。

## 方法
- GitHub新建一个仓库，并复制SSH地址
    ```
    git@github.com:git201901/git_learning.git
    ```
- `git remote add 名称`
    ```shell
    pc:git-learning suling$ git remote add github git@github.com:git201901/git_learning.git
    ```
    这里的`github`就是自定义的一个名称，用于替换后面的远程地址。方便后续`git push github`以及`git fetch github`。