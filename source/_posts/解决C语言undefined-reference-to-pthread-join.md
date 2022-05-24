---
title: 解决C语言undefined reference to pthread_join
date: 2021-11-17 19:30:20
updated:
tags: [C, Bug]
categories: [Bug踩坑记录]
---

## 保留现场
`undefined reference to sleep`同样的问题。
在使用C语言线程函数时，需要包含`#include <pthread>`，编译时就会报这种错误。

## 探究原因

`pthread` 库不是 `Linux` 系统默认的库，连接时需要使用静态库 `libpthread.a`，所以在使用`pthread_create()`创建线程，以及调用` pthread_atfork()`函数建立`fork`处理程序时，需要链接该库。

## 解决方法

```bash
gcc thread.c -o thread -lpthread

```



如果是`Makefile`配置的编译条件，在`Makefile`文件中加上如下：

```bash
CFLAGS += -lpthread
```

