---
title: Git hooks钩子的使用
date: 2022-05-30 12:16:11
updated:
tags:
categories:
---

## Git hooks简介

Git 能在特定的重要动作发生时触发自定义脚本。比如，`commit`之前检查`commit message`是否符合约定的格式，`push`之前检查代码格式是否正确，是否编译通过等等。Git就提供了`hooks`这样的机制。

我们在哪能找到`hooks`呢？在初始化代码仓库`git init`时，Git会自动为我们创建一个`.git/hooks`目录，里面存放了所有的钩子。因为`.git`是隐藏目录，显示隐藏目录后就可以找到`hooks`这个目录。

在VSCode里一般默认把`.git`目录排除显示，所以打开项目目录时不会显示该目录，我们可以收到在VSCode显示`.git`目录：

打开设置界面，搜索`exclude`找到图中的设置，将`.git`目录从排除列表中移除，即可在VSCode中显示`.git`目录。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220530134106.png)

现在我们找到了`hooks`，该如何使用呢？

所有默认的`hooks`都是以`.sample`为后缀，只需要移除`.sample`即可激活`hooks`。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220530154954.png)

随便打开一个`hooks`文件，我们可以发现，实际是`hooks`就是一个个`shell`脚本。这些脚本会在特定的动作发生时被执行。示范的这些`hooks`都是`shell`脚本，**实际上只要是文件名正确的可执行脚本都可以使用**，如将`pre-push`内容改为`python, Ruby`等等脚本都可以。

## 使用一个hooks

以`pre-commit`这个`hooks`为例，来示范一下如何使用Git hooks。

- 打开`.git/hooks/pre-commit.sample`，这个`hooks`的大体功能是检查文件名是否包含非`ASCII`字符，如果包含，则无法执行`commit`操作，并提示用户修改文件名。
- 删除`pre-commit.sample`的后缀
    ```
    ➜ mv .git/hooks/pre-commit.sample .git/hooks/pre-commit
    ```
- 添加一个有汉字的文件名，如`测试.md`
    ```
    ➜  touch 测试.md
    ```
- 将新文件提交
    ```
    ➜ git add 测试.md
    ➜ git commit -m "测试"
    Error: Attempt to add a non-ASCII file name.

    This can cause problems if you want to work with people on other platforms.

    To be portable it is advisable to rename the file.

    If you know what you are doing you can disable this check using:

    git config hooks.allownonascii true
    ```
    > 如果无法执行`pre-commit`可能未被赋予执行权限，修改一下权限即可：`chmod +x .git/hooks/pre-commit`

我们可以发现，在进行`commit`操作时被中断了，会提示用户修改文件名。其他的`hooks`用法类似，我们可以自定义在什么时候可以`push`，什么时候可以`rebase`等等。

`hooks`通常会被用来做提交代码前的一个检查，比如风格是否统一，编译是否通过等等。如果团队合作时，这样的检查最好能够与成员保持一致，但是`hooks`所在的`.git`目录是不会被Git自己版本管理的，换句话说，它不能推送到远端与成员共享。那么如何解决这个问题呢？

## 如何同步hooks文件

### 与源码放在一起

代码仓库中新建一个`hooks`目录，将该目录同步到远程。其他成员下载代码时也会下载`hooks`目录，通过脚本的方式将`hooks`目录覆盖本地的`.git/hooks`目录。
```
#!/bin/bash
cp -r ./hooks/ .git/hooks/
chmod +x -R .git/hooks
echo 'Hooks sync to remote success!'
exit 0
```

## 参考资料
[C++ 项目中使用 Pre-commit 协助实现代码规范检查_清欢守护者的博客-CSDN博客](https://blog.csdn.net/irving512/article/details/124377109)
[git push之前自动编译验证 - 简书](https://www.jianshu.com/p/7951ff907ccb)