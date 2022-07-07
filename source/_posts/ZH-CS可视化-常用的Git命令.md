---
title: ZH-CS可视化-常用的Git命令
date: 2022-07-07 16:20:48
updated:
tags: [Git, 翻译]
categories:
---
#  CS可视化-常用的Git命令

尽管 Git 是一个非常强大的工具，但我想大多数人都会同意，当我说它也可能是……一场彻头彻尾的噩梦当我执行某个命令时分支交互，它将如何影响历史记录？当我在`master`分支执行`hard reset`、`force push`到 `origin`、在`.git`文件夹执行`rimraf`的时候，为什么我的同事都哭了？

我认为这将是创建一些最常见和最有用命令的可视化示例的完美用例！我介绍的许多命令都有可选参数，您可以使用这些参数来更改它们的行为。在我的示例中，我将介绍命令的默认行为，而不添加（太多）配置选项！

## Merging
拥有多个分支非常方便，可以将新更改彼此分开，并确保您不会意外地将未经批准或损坏的更改推送到生产环境。一旦更改获得批准，我们希望在我们的生产分支中获得这些更改！

将更改从一个分支转移到另一个分支的一种方法是执行 `git merge`！ Git 可以执行两种类型的合并：`fast-forward` 或​​ `no-fast-forward`。

现在这可能没有多大意义，所以让我们看看差异！

###  Fast-forward (`--ff`)


如果当前分支与即将合并过来的分支相比，没有额外的提交，这种就是`fast-forward`合并。Git 很会偷懒，它会首先尝试最简单的方案，即`fast-forward`。这种合并方式不会创建新的提交，只是把另一个分支的提交记录直接合并到当前分支。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707163529.gif)

完美的！我们现在可以在 `master` 分支上使用在 `dev` 分支上所做的所有更改。那么，`no-fast-forward` 到底是什么？

###  No-fast-foward (`--no-ff`)

如果与您要合并的分支相比，您当前的分支没有任何额外的提交，那就太好了，但不幸的是，这种情况很少见！如果我们在当前分支上提交了我们想要合并的分支没有的更改，Git 将执行 `no-fast-forward` 合并。

使用 `no-fast-forward` 合并，Git 在活动分支上创建一个新的**合并提交**。提交的父提交指向活动分支和我们要合并的分支！

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707164009.gif)

没什么大不了的，完美的合并！ `master` 分支现在包含我们在 `dev` 分支上所做的所有更改。

###  Merge Conflicts

尽管 Git 擅长决定如何合并分支和向文件添加更改，但它不能总是自己做出这个决定。当我们尝试合并的两个分支在同一个文件的同一行上发生更改时，可能会发生这种情况，或者如果一个分支删除了另一个分支修改的文件，等等。

在这种情况下，Git 会要求您帮助决定我们要保留两个选项中的哪一个！假设在两个分支上，我们编辑了 `README.md` 中的第一行。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707164137.png)

如果我们想将 `dev` 合并到 `master` 中，这将导致合并冲突：您希望标题是 `Hello!` 还是 `Hey!`？

当试图合并分支时，Git 会告诉你冲突发生在哪里。我们可以手动删除不想保留的更改，保存更改，再次添加更改的文件，然后提交更改

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707164314.gif)

耶！尽管合并冲突通常很烦人，但它完全有道理：Git 不应该自己决定选择哪一个更改。

## Rebasing

我们刚刚看到了如何通过执行 `git merge` 将更改从一个分支应用到另一个分支。另一种将更改从一个分支添加到另一个的方法是执行`git rebase`。

`git rebase` *复制*当前分支的提交，并将这些复制的提交放在指定分支的顶部。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707164518.gif)

完美，我们现在可以在 `dev` 分支上使用在 `master` 分支上所做的所有更改！

与合并相比，一个很大的区别是 Git 不会尝试找出要保留和不保留的文件。我们正在变基的分支总是有我们想要保留的最新更改！通过这种方式，您不会遇到任何合并冲突，并保持良好的线性 Git 历史记录。

这个例子展示了基于 `master` 分支的变基。然而，在更大的项目中，您通常不想这样做。 `git rebase` **改变了项目的历史**，因为为复制的提交创建了新的哈希！

每当您在功能分支上工作并且主分支已更新时，重新定基都很棒。您可以获得分支上的所有更新，这将防止未来的合并冲突！

###  Interactive Rebase

在重新提交提交之前，我们可以修改它们！我们可以使用 *interactive rebase* 来做到这一点。交互式变基对于您当前正在处理的分支也很有用，并且想要修改一些提交。

我们可以对我们正在变基的提交执行 6 项操作：

- `reword`: Change the commit message
- `edit`: Amend this commit
- `squash`: Meld commit into the previous commit
- `fixup`: Meld commit into the previous commit, without keeping the commit's log message
- `exec`: Run a command on each commit we want to rebase
- `drop`: Remove the commit


惊人的！这样，我们可以完全控制我们的提交。如果我们想删除一个提交，我们可以直接 `drop` 它。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707164621.gif)

或者，如果我们想将多个提交压缩在一起以获得更清晰的历史记录，没问题！

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707164900.gif)

交互式变基使您可以对尝试变基的提交进行大量控制，即使在当前活动分支上也是如此！

##  Resetting
我们可能会提交我们以后不想要的更改。也许它是一个`WIP`提交，或者是一个引入错误的提交！在这种情况下，我们可以执行 `git reset`。

`git reset` 会删除所有当前暂存的文件，并让我们控制 `HEAD` 应该指向的位置。

### Soft reset

*软重置*将 `HEAD` 移动到指定的提交（或提交的索引与 `HEAD` 相比），而不会消除随后在提交中引入的更改！

假设我们不想保留添加了`style.css`文件的提交`9e78i`，也不想保留添加了`index.js`文件的提交`035cc`。但是，我们确实希望保留新添加的 `style.css` 和 `index.js` 文件！软重置的完美用例。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707165037.gif)

输入 `git status` 时，您会看到我们仍然可以访问对先前提交所做的所有更改。这很棒，因为这意味着我们可以修复这些文件的内容并在以后再次提交它们！

### Hard reset

有时，我们不想保留某些提交引入的更改。与软重置不同，我们不再需要访问它们。 Git 应该简单地将其状态重置回指定提交时的状态：这甚至包括工作目录和暂存文件中的更改！

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707165117.gif)

Git 丢弃了在 `9e78i` 和 `035cc` 上引入的更改，并将其状态重置为提交 `ec5be` 时的状态。


###  Reverting

撤消更改的另一种方法是执行`git revert`。通过恢复某个提交，我们创建了一个包含恢复的更改的新提交！

假设 `ec5be` 添加了一个 `index.js` 文件。后来，我们实际上意识到我们不再希望这次提交引入的这种变化！让我们恢复 `ec5be` 提交。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707165159.gif)

完美的！提交`9e78i`恢复了由`ec5be`提交引入的更改。执行 `git revert` 非常有用，可以撤消某个提交，而无需修改分支的历史记录。


##   Cherry-picking

当某个分支包含在活动分支上引入了我们需要的更改的提交时，我们可以 `cherry-pick` 该命令！通过 `cherry-pick` 提交，我们在活动分支上创建了一个新提交，其中包含由 `cherry-pick` 提交所引入的更改。

假设 `dev` 分支上的提交 `76d12` 添加了我们想要在 `master` 分支中的 `index.js` 文件的更改。我们不想要*整个*，我们只关心这一次提交！

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707170039.gif)

很酷，`master` 分支现在包含了 `76d12` 引入的更改！

## Fetching

如果我们有一个远程 Git 分支，例如 Github 上的一个分支，则可能会发生远程分支具有当前分支没有的提交！也许另一个分支被合并了，你的同事推送了一个快速修复，等等。

我们可以通过在远程分支上执行 `git fetch` 在本地获取这些更改！它不会以任何方式影响您的本地分支：`fetch` 只是下载新数据。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707170120.gif)

我们现在可以看到自上次推送以来所做的所有更改！既然我们在本地拥有新数据，我们就可以决定要如何处理这些数据。



##  Pulling

虽然 `git fetch` 对于获取分支的远程信息非常有用，但我们也可以执行 `git pull`。 `git pull` 实际上是两个命令合二为一：`git fetch` 和 `git merge`。当我们从源中提取更改时，我们首先像使用 `git fetch` 一样获取所有数据，之后最新的更改会自动合并到本地分支中。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707170157.gif)

太棒了，我们现在与远程分支完美同步，并拥有所有最新更改！



##   Reflog

每个人都会犯错，这完全没关系！有时你可能会觉得你把你的 `git repo` 搞砸了，以至于你只想完全删除它。

`git reflog` 是一个非常有用的命令，用于显示所有已采取的操作的日志！这包括合并、重置、恢复：基本上是对分支的任何更改。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707170250.gif)

如果您犯了错误，您可以根据 `reflog` 提供给我们的信息通过重置 `HEAD` 轻松地重做此操作！

假设我们实际上并不想合并 `origin` 分支。当我们执行 `git reflog` 命令时，我们看到合并前 repo 的状态是在 `HEAD@{1}`。让我们执行 `git reset` 将 HEAD 指向它在 `HEAD@{1}` 上的位置！

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220707170316.gif)

我们可以看到最新的action已经推送到`reflog`了！

