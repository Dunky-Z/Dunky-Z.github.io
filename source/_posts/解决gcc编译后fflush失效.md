---
title: 解决gcc编译后fflush失效
date: 2021-10-21 09:56:51
tags: [Bug,C]
---
## 保留现场

使用`scanf()`获取输入时，因为涉及键盘缓冲区的问题，每次输入后想要把缓冲清空，但是在gcc编译后，使用`fflush`无法清空缓冲区。

## 探究原因

C标准(ISO/IEC 9899:1999 standard)规定`fflush(stdin)`操作是未定义的<参看《ISO/IEC 9899:1999 standard》p270>;。也就是说不一定能实现刷新功能，但有的编译器可能不遵循标准，对`fflush(stdin)`操作不予警告，并且有时可能产生正确的结果，但最好不要这样使用。

## 解决方法

通过 `while` 循环把输入流中的余留数据“吃”掉：

```c
int c;
while ((c=getchar()) != ‘\n’ && c != EOF);

```

