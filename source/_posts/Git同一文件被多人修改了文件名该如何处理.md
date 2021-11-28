---
title: Git同一文件被多人修改了文件名该如何处理
date: 2021-11-28 21:55:24
updated:
tags: [Git]
categories: [Git实战]
---
用户一修改了文件名，并推送到了远端。用户二也修改了文件名，在进行推送时，就会被拒绝。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111282158733.png)

拉取最新代码后发现有相同的文件，只是文件名不同。`index1.htm`和`index2.htm`两个文件内容是完全相同的。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111282159666.png)

查看当前状态，可知有其他想把文件名修改为`index2.htm`。此时只需要根据提示，删除`index.htm`。协商后决定保留哪一个文件，比如我们决定保留`index1.htm`。那么删除`index2.htm`。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111282203900.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111282204020.png)

最后在`commit`一次，即可顺利推送。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202111282205646.png)
