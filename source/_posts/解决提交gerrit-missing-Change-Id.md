---
title: 解决提交gerrit missing Change-Id
date: 2022-07-30 15:05:48
updated:
tags: [Bug]
categories: [Bug踩坑记录]
---

## 保留现场
```bash
remote: Resolving deltas: 100% (114/114)
remote: Processing changes: refs: 1,done   
remote: ERROR: missing Change-Idincommit message footer
remote:
remote: Hint: To automatically insert Change-Id,installthe hook:
remote:   gitdir=$(git rev-parse --git-dir);scp-p -P XX XX@gerrit.xxxxx.com:hooks/commit-msg${gitdir}/hooks/
remote: And then amend the commit:
remote:   git commit --amend
```

## 探究原因

### 理解change-id

代码审核是要对一个完整的变更进行审核，比如一次Bug修复，有多次提交Commit，每次的Commit Id都不同，那么如何将多个不同的Commit ID 关联到同一个Chanege-Id呢？我们需要将Change-Id添加到Commit的footer（最后一行）中，这样就可以将多个Commit关联到同一个Change-Id了。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207301909075.png)
Change-Id 为避免与提交 Id 冲突，通常以大写字母I为前缀。此外，我们需要明确，Change-Id 是Gerrit的概念，不是Git的概念。你只有用Gerrit才会有Change-Id，而Git只有提交 Id。

那么这个Change-Id是怎么生成的呢？

### 理解git hooks
我在[Git hooks钩子的使用](https://dunky-z.github.io/2022/05/30/Git-hooks%E9%92%A9%E5%AD%90%E7%9A%84%E4%BD%BF%E7%94%A8/)中有详细解释。在这里简单的介绍一下，钩子(hooks)是一些在`.git/hooks`目录的脚本, 在被特定的事件触发后被调用。比如执行`git commit`，`git push`，`git pull`等命令时，脚本会被调用。

Gerrit也提供了一个标准的`commit-msg`钩子，当我们在执行`git commit`时，会被调用。会自动生成`Change-Id`，并将其添加到`commit`的footer中。

通常我们从远程下载代码后，会自动下载`commit-msg`钩子，并将其添加到`.git/hooks`目录中。正常来说`hooks`是不会加入代码仓库的，这应该取决于Gerrit的配置。

这次错误应该是我在测试钩子的时候，将Gerrit标准钩子删除了，导致无法正确生成Change-Id。
## 解决方法

报错时其实已经提供了解决方式：

```bash
# 提示让我们安装远程的钩子
remote: Hint: To automatically insert Change-Id,installthe hook:

# 在命令行输入以下两条命令：
# 这条命令将找到该项目的 git 目录,并将其赋值给 gitdir 这个变量
gitdir=$(git rev-parse --git-dir)
# 执行 scp 命令,从 gerrit 代码服务器将钩子脚本文件 commit-msg 下载到项目的钩子目录下 (一般是 .git/hooks/)
scp-p -P XX XX@gerrit.xxxxx.com:hooks/commit-msg${gitdir}/hooks/
```

安装完之后重新`git commit --amend`，就可以正常生成Change-Id了。