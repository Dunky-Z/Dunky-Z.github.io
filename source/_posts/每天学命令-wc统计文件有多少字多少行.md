---
title: 每天学命令-wc统计文件有多少字多少行
date: 2021-07-30 17:26:39
tags: [linux,每天学命令]
---
想知道自己代码写了多少行，可以一个`wc`命令搞定。


## 可选参数
```
-l ：仅列出行；
-w ：仅列出多少字(英文单字)；
-m ：多少字符
```

## 使用实例
统计`hello.c`文件夹下文件总共多少行
```
dominic@hanhan:~/learning-linux/helloworld/c$ wc -l  hello.c
14 hello.c
```