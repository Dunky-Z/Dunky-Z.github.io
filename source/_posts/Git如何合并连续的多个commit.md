---
title: Git如何合并连续的多个commit
date: 2021-11-24 23:18:49
updated:
tags: [Git]
categories: [Git实战]
---
- 确定需要合并的`commit`
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111242323497.png)
- 变基操作，以需要合并的`commit`下方的结点为基准。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111242324125.png)

- 交互式变基，`squash`表示合并到上方`commit`
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111242325615.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111242326279.png)

- 编写合并`commit`的`message`，保留原先的不变
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111242328440.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111242328175.png)