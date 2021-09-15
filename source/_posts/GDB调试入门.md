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
## set args带参数调试
有时候程序不是直接可以运行的，需要加上一些必要的参数。带上参数运行很容易，只要在程序名后加上相应参数即可，但是如何带上参数进行调试呢？这就需要`set args`命令。

比如在`BombLab`实验中，我们不可能一次解决所有`phase`，但是每次重新调试，已经解决的`phase`还要重新输入一次答案，这就很麻烦，好在这个实验的作者也考虑到了，他支持读取文本。我们可以把答案预先写入一个文本文件中，程序读取已经保存的答案即可跳过相应的`phase`。

假设我们把答案写入了`solutions.txt`文件中，首先，我们加载程序，然后通过`set args solutions.txt`设置运行参数。
```bash
(gdb) file bomb
Reading symbols from bomb...
(gdb) set args solutions.txt 
(gdb) r
Starting program: /home/dominic/learning-linux/bomb/bomb solutions.txt 
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
Phase 1 defused. How about the next one?
That's number 2.  Keep going!
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

### set list num设置默认显示代码行数
```
(gdb) set list 20   //默认显示20行代码
```
### list linenumber查看指定行代码
```
(gdb) l 10  
(gdb) l main.h : 10 //指定main.c文件中的第十行
```

### list function查看指定函数的代码
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

## 启动与退出
### run启动程序直到遇到断点
```
(gdb) run  
```

### start启动程序并在第一条代码处停下

```
(gdb) start
```
### quit退出调试

```
(gdb) quit
```

## 调试命令
### print打印变量值
| 格式化字符 (/fmt) | 说明                                 |
|-------------------|--------------------------------------|
| /x                | 以十六进制的形式打印出整数。         |
| /d                | 以有符号、十进制的形式打印出整数。   |
| /u                | 以无符号、十进制的形式打印出整数。   |
| /o                | 以八进制的形式打印出整数。           |
| /t                | 以二进制的形式打印出整数。           |
| /f                | 以浮点数的形式打印变量或表达式的值。 |
| /c                | 以字符形式打印变量或表达式的值。     |

```
(gdb) p i       # 10进制
$5 = 3
(gdb) p/x i     # 16进制
$6 = 0x3
(gdb) p/o i     # 8进制
$7 = 03

```
### ptype打印变量类型

```
(gdb) ptype i
type = int
(gdb) ptype array[i]
type = int
(gdb) ptype array
type = int [12]
```

### display跟踪显示变量

## layout分割窗口，边调试边看源码
### layout src
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830153452.png)
### layout asm
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830153520.png)
### layout split
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830153555.png)
