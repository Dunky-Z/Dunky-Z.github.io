---
title: Gerrit批量添加抄送提醒
date: 2022-07-29 13:58:27
updated:
tags:
categories:
---

## 背景
公司使用Gerrit作为Review平台，但是每次提交代码都需要手动添加Reviewer，还要抄送组内成员，甚是麻烦。既然每次提交代码都能自动收到Jenkins的提醒，那么肯定也有办法提醒其他成员吧，Gerrit还真提供了这样的功能。

## 解决方法
官方示例：
```
git push ssh://john.doe@git.example.com:29418/kernel/common HEAD:refs/for/experimental%r=a@a.com,cc=b@o.com
```

最后的`%`是个分隔符，`r='a@a.com`表示Reviewer是`a@a.com`，`cc=b@o.com`表示抄送组内成员是`b@o.com`。

以BOOTROM为例：



但是要这么写，岂不是把操作搞更复杂了。终极办法，打开项目路径下的`.git`目录。编辑`config`文件：

原文件里有如下字段：

我们可以将远程仓库名换成容易区分的名字，自己随意：

当我们执行`git push review`时，相当于执行了下面的命令：

## 参考资料
[Gerrit Code Review - Uploading Changes](https://gerrit-review.googlesource.com/Documentation/user-upload.html#push_create,)