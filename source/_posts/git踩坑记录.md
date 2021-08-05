---
title: git踩坑记录
date: 2021-07-23 11:55:57
tags: [Git]
---

## 创建仓库时没有加入gitignore文件，上传了不需要的文件，后添加了gitignore文件如何同步远程与本地的文件（自动删除不需要的文件）
```shell
# 注意有个点“.”
取消版本控制
git rm -r --cached .
重新添加
git add -A
重新提交
git commit -m "update .gitignore"
```

## Git rm和rm --cached区别
`rm` ：当需要删除暂存区或分支上的文件，同时工作区不需要这个文件

`rm --cached`：当需要删除暂存区或分支上的文件，同时工作区需要这个文件，但是不需要被版本控制。就是本地需要保留，但是远程不保留


## 推送空文件夹到远程仓库
在需要推送的空文件下创建".gitkeep"文件
在".gitignore"文件中编写规则
`!.gitkeep`

## 克隆指定分支代码
```
 git clone  -b master https://github.com/Dunky-Z/Dunky-Z.github.io.git
 ```
`master`就是分支名