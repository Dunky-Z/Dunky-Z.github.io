---
title: GDB调试入门
date: 2021-08-29 18:40:16
tags: [Linux,GDB,CSAPP]
---

## file加载程序
```shell
(gdb) file bomb
Reading symbols from bomb...
```
## list查看源码
### 查看10行源码
每条命令显示10行代码
```shell
(gdb) l
23	#include <stdio.h>
24	#include <stdlib.h>
25	#include "support.h"
26	#include "phases.h"
27	
28	/* 
29	 * Note to self: Remember to erase this file so my victims will have no
30	 * idea what is going on, and so they will all blow up in a
31	 * spectaculary fiendish explosion. -- Dr. Evil 
32	 */
(gdb) l
33	
34	FILE *infile;
35	
36	int main(int argc, char *argv[])
37	{
38	    char *input;
39	
40	    /* Note to self: remember to port this bomb to Windows and put a 
41	     * fantastic GUI on it. */
42
```
## break 打断点
### break linenum对指定行打断点
```shell
(gdb) b 36
Note: breakpoint 1 also set at pc 0x400da0.
Breakpoint 2 at 0x400da0: file bomb.c, line 37.
```
### break function对指定函数打断点
```shell
(gdb) b main
Breakpoint 3 at 0x400da0: file bomb.c, line 37.
(gdb) b phase_1
Breakpoint 4 at 0x400ee0
```
## 删除断点包括禁用断点
### delete删除所有断点
```shell
(gdb) delete 
Delete all breakpoints? (y or n) y
```

### disable breakpoint禁用断点 
```shell
(gdb) info b #先看有哪些断点
Num     Type           Disp Enb Address            What
3       breakpoint     keep y   0x0000000000400da0 in main at bomb.c:37
4       breakpoint     keep y   0x0000000000400ee0 <phase_1>
(gdb) d 3 #禁用第三号断点
(gdb) info b #再次查看断点信息发现已经没有第三号断点
Num     Type           Disp Enb Address            What
4       breakpoint     keep y   0x0000000000400ee0 <phase_1>
```

### clear function删除一个函数中所有的断点
```shell
(gdb) info b
Num     Type           Disp Enb Address            What
4       breakpoint     keep y   0x0000000000400ee0 <phase_1>
(gdb) clear phase_1
(gdb) info b
Deleted breakpoint 4 No breakpoints or watchpoints.
```

## layout分割窗口，边调试边看源码
### layout src
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830153452.png)
### layout asm
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830153520.png)
### layout split
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830153555.png)
