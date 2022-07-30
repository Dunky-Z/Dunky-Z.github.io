---
title: Gerrit批量添加抄送提醒
date: 2022-07-29 13:58:27
updated:
tags:
categories:
---

## 背景
公司使用Gerrit作为Review平台，但是每次提交代码都需要手动添加Reviewer，还要抄送组内成员，这种重复性劳动，程序员是绝不能容忍的。gerrit提供了发送邮件的功能。

## 解决方法
官方示例：
```
git push ssh://john.doe@git.example.com:29418/kernel/common HEAD:refs/for/experimental%r=a@a.com,cc=b@o.com
```

最后的`%`是个分隔符，`r='a@a.com`表示Reviewer是`a@a.com`，`cc=b@o.com`表示抄送组内成员是`b@o.com`。
> 注意！邮箱之间不能有空格！

以一个仓库为例：
```
git push origin HEAD:refs/for/branch_dev_name%cc=zhangsan@qq.com,cc=lisi@qq.com,cc=wangerma@qq.com,cc=chenwu@qq.com
```

但是要这么写，岂不是把操作搞更复杂了。

终极办法，打开项目路径下的`.git`目录。编辑`config`文件：

原文件里有如下字段：

```
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	ignorecase = true
[remote "origin"]
	url = git@github.com:Dunky-Z/Dunky-Z.github.io.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

我们可以将远程仓库名换成容易区分的名字，自己随意：

```
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	ignorecase = true
[remote "origin"]
	url = git@github.com:Dunky-Z/Dunky-Z.github.io.git
	fetch = +refs/heads/*:refs/remotes/origin/*
# 以下为新增内容
[remote "review"]
	url = git@github.com:Dunky-Z/Dunky-Z.github.io.git
	fetch = +refs/heads/*:refs/remotes/origin/*
	push = 	HEAD:refs/for/%cc=zhangsan@qq.com,
	cc=lisi@qq.com,
	cc=wangerma@qq.com,
	cc=chenwu@qq.com
```

下次想要推送需要review的代码，就直接执行`git push review`，其中`push`就相当于：

```
push HEAD:refs/for/%cc=zhangsan@qq.com,cc=lisi@qq.com,cc=wangerma@qq.com,cc=chenwu@qq.com
```

## 参考资料
[Gerrit Code Review - Uploading Changes](https://gerrit-review.googlesource.com/Documentation/user-upload.html#push_create,)