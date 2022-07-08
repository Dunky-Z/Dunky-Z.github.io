---
title: Git-git pull与git pull --rebase的区别
date: 2021-11-29 16:09:12
updated:
tags:
categories: [Git实战]
---
```bash
git pull == git fetch + git merge
git pull --rebase == git fetch + git rebase
```

拆解来看这两个命令就是在拉取远端代码后，是合并还是进行变基操作。

假设当前有三个提交`A,B,C`，并且分支`feature`都与远程代码同步。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211129154905.png)

我们在`feature`上做了一些修改，并产生了`E`提交，远程也有用户进行了更新到了`D`提交。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211129155138.png)

此时我们需要`git fetch`获取最新的代码，然后`git merge`解决冲突后重新`git add` `git commit`，得到`F`提交。最后`git push`即可成功推送，得到如下的关系

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211129155544.png)

而使用`git rebase`将会创建一个新的提交`F`，`F`的文件内容和上面`F`的一样，但我们将E提交废除，当它不存在（图中用虚线表示）。由于这种删除，避免了菱形的产生，保持提交曲线为直线。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211129162532.png)

在`rebase`的过程中，有时也会有冲突，这时Git会停止`rebase`并让用户去解决冲突，解决完冲突后，用`git add`添加修改的文件，然后不用执行`git commit`，直接执行`git rebase --continue`，这样git会继续apply余下的补丁。

