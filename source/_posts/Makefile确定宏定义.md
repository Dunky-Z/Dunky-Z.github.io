---
title: Makefile确定宏定义
date: 2022-07-27 08:28:03
updated:
tags: [C, Makefile]
categories:
---

有时需要通过`make`编译命令时确定代码中的宏定义，如编译不同的版本只需要使用不同的编译命令即可，而不需要修改内部代码。

当前的需求是代码中有一部分代码通过宏定义来确定编译的是DIE0版本还是DIE1版本，如果定义了`DIE_ORDINAL_0` 就使用DIE0的基地址，如果未定义就使用DIE1的基地址。

```C
#define DIE_ORDINAL_0
#ifdef DIE_ORDINAL_0
#define PERIPH_BASE (SYS_BASE_ADDR_DIE0)
#else
#define PERIPH_BASE (SYS_BASE_ADDR_DIE1)
#endif
```

gcc命令支持`-D`宏定义，相当于C中的全局`#define`，在Makefile中我们可以通过宏定义来控制源程序的编译。只要在Makefile中的CFLAGS中通过选项-D来指定你于定义的宏即可。

```Makefile
CFLAGS += -D DIE_ORDINAL_0
# 在编译的时候加上此选项就可以了
$(CC) $(CFLAGS) $^ -o $@
```

这样的话，相当于设置了`DIE_ORDINAL_0`这个宏定义。但是我们想通过命令行的参数来决定是否使用这个宏定义，可以通过一些简单的方法获取：

```Makefile
ifeq ($(DIE0), y)
  CFLAGS +=-DDIE_ORDINAL_0
else
  CFLAGS +=-DDIE_ORDINAL_1
endif
$(CC) $(CFLAGS) $^ -o $@
```

从命令行找到`DIE0`这个参数，如果它等于`y`表示使用`DIE_ORDINAL_0`。如果不等于`y`则使用`DIE_ORDINAL_1`，因为我们代码里没有`DIE_ORDINAL_1`，所以就相当于没有定义`DIE_ORDINAL_0`。

命令行示例：

```Bash
# 编译DIE0
make DIE0="y"
# 编译DIE1
make DIE0="n"
```