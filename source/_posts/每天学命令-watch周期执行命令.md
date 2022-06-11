---
title: 每天学命令-watch周期执行命令
date: 2022-06-09 22:50:54
updated:
tags: [Linux,每天学命令]
categories:
---
 ## 功能
  watch命令的功能如其名，可以监视命令的执行结果。它实现的原理就是每隔一段时间执行一次命令，然后显示结果。他的用途很广，具体怎么用就靠想象力了。

## 命令参数
```
-n # 或--interval  watch默认每2秒运行一下程序，可以用-n或-interval来指定间隔的时间。
-d # 或--differences  用-d或--differences 选项watch 会高亮显示变化的区域。 而-d=cumulative选项会把变动过的地方(不管最近的那次有没有变动)都高亮显示出来。
-t # 或-no-title  会关闭watch命令在顶部的时间间隔,命令，当前时间的输出。
-h # 或--help # 查看帮助文档
```

## 实例

```
watch -d 'ls -l | grep tmp'       # 监测当前目录中 scf' 的文件的变化
```