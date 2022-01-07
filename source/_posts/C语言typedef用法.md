---
title: C语言typedef用法
date: 2022-01-07 11:51:50
updated:
tags:
categories:
---
## 简介
`typedef`为C语言的关键字，作用是为一种数据类型定义一个新名字。这里的数据类型包括内部数据类型（int,char等）和自定义的数据类型（struct等）。在使用语法上类似与`static`，`extern`等。
`typedef` 行为有点像 `#define` 宏，用其实际类型替代同义字。不同点是 `typedef `在编译时被解释，因此让编译器来应付超越预处理器能力的文本替换。




## 基本使用方法

示例1：
```
int a; ———— 传统变量声明表达式
int myint_t; ———— 使用新的类型名myint_t替换变量名a
typedef int myint_t; ———— 在语句开头加上typedef关键字，myint_t就是我们定义的新类型
```
示例2：
```
void (*pfunA)(int a); ———— 传统变量（函数）声明表达式
void (*PFUNA)(int a); ———— 使用新的类型名PFUNA替换变量名pfunA
typedef void (*PFUNA)(int a); ———— 在语句开头加上typedef关键字，PFUNA就是我们定义的新类型
```

促使我写这篇文章的原因不是如何去用`typedef`，而是在代码中看不懂如何简化了一个复杂声明。比如上文的
```
typedef void (*PFUNA)(int a);
```
本以为是将`void`类型替换成了`(*PFUNA)(int a)`，但是语法上这明显讲不通啊。现在明白了，这就是将`void (*pfunA)(int a);`类型名换成了`PFUNA`。以后就可以用`PFUNA`来声明变量。比如
```
PFUNA arr[10]
```
表示声明了一个大小为`10`的数组，数组的元素是`PFUNA`类型。将`PFUNA`类型展开就是，这是一个函数指针，函数参数为`int`类型，返回值为`void`类型。完整的含义就是，**声明了一个大小为`10`的数组，数组元素是函数指针，函数参数为`int`类型，返回值为`void`类型**。

## 代码简化
`typedef`可以为复杂的声明定义一个新的简单的别名。关于复杂声明，可以阅读这篇[C语言复杂声明](https://dunky-z.github.io/2021/10/22/C%E8%AF%AD%E8%A8%80%E5%A4%8D%E6%9D%82%E5%A3%B0%E6%98%8E/)。
方法是：在原来的声明里逐步用别名替换一部分复杂声明，递归操作，把带变量名的部分留到最后替换，得到的就是原声明的最简化版。举例： 
```
//复杂声明
void (*b[10]) (void (*)());
```
变量名为`b`，先替换右边部分括号里的，`pFunParam`为别名
```
typedef void (*pFunParam)();
```
再替换左边的变量`b`，`pFunx`为别名二：
```
typedef void (*pFunx)(pFunParam);
```
简化后的声明：
```
pFunx b[10];
```

## 减少错误

定义一种类型的别名，而不只是简单的宏替换。可以用作同时声明指针型的多个对象。比如：
```
// 这多数不符合我们的意图，它只声明了一个指向字符变量的指针，
// 和一个字符变量；
char* pa, pb;
```
以下则可行：
```
typedef char* PCHAR;
PCHAR pa, pb;  
```
这种用法很有用，特别是`char* pa, pb`的定义，初学者往往认为是定义了两个字符型指针，其实不是，而用`typedef char* PCHAR`就不会出现这样的问题，减少了错误的发生。

## 直观简洁
```
struct tagPOINT1
 {
    int x;
    int y; 
};
struct tagPOINT1 p1;
```
## Reference
https://blog.csdn.net/liitdar/article/details/80069638

https://blog.csdn.net/wangqiulin123456/article/details/8284939