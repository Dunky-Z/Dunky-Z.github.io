---
title: '解决fatal error: bits/libc-header-start.h：no such file'
date: 2021-09-03 09:26:34
tags: [Linux,汇编语言,GCC,Bug]
categories: [Bug踩坑记录]
---

## 保留现场
想要分别编译32位和64位的程序时，gcc出现了错误，

```
In file included from func_call.c:1:
/usr/include/stdio.h:27:10: fatal error: bits/libc-header-start.h: 没有那个文件或目录
   27 | #include <bits/libc-header-start.h>
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~
compilation terminated.
```

## 问题解决
问题原因猜测是默认gcc只提供当前机器的版本，解决如下

```
apt install gcc-multilib
```
