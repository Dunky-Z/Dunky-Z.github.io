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
声明`struct`新对象时，必须要带上`struct`

```c
struct tagPOINT1
 {
    int x;
    int y; 
};
struct tagPOINT1 p1;
```
在经常使用这个结构体时，就显得麻烦，可以用`typedef`简化
```c
typedef struct tagPOINT
{
    int x;
    int y;
}POINT;
```

## 定义平台无关的类型
当跨平台时，只要改下 `typedef` 本身就行，不用对其他源码做任何修改。
```c
typedef unsigned int u_32t; 
```

## 掩饰复合类型


`typedef` 还可以掩饰复合类型，如指针和数组。 

例如，你不用像下面这样重复定义有 81 个字符元素的数组： 
```c
char line[81];
```
定义一个 `typedef`，每当要用到相同类型和大小的数组时，可以这样： 
```c
typedef char Line[81]; 
```
此时Line类型即代表了具有81个元素的字符数组，使用方法如下： 
```c
Line text, secondline; 
```
同样，可以象下面这样隐藏指针语法： 
```c
typedef char * pstr;
```
这里将带我们到达第一个 `typedef` 陷阱。标准函数 `strcmp()`有两个`const char *`类型的参数。因此，它可能会误导人们象下面这样声明 `mystrcmp()`： 
```c
int mystrcmp(const pstr, const pstr); 
```
用GNU的gcc和g++编译器，是会出现警告的，按照顺序，`const pstr`被解释为`char* const`（一个指向 `char` 的指针常量），两者表达的并非同一意思。为了得到正确的类型，应当如下声明： 
```c
typedef const char* pstr;
```

## typedef 和存储类关键字
`typedef` 就像 `auto`，`extern`，`mutable`，`static`，和 `register` 一样，是一个存储类关键字。这并不是说 `typedef` 会真正影响对象的存储特性；它只是说在语句构成上，`typedef` 声明看起来象 `static`，`extern` 等类型的变量声明。下面将带到第二个陷阱： 
```c
typedef register int FAST_COUNTER; // 错误
```

编译通不过。问题出在你不能在声明中有多个存储类关键字。因为符号 `typedef` 已经占据了存储类关键字的位置，在 `typedef` 声明中不能用 `register`（或任何其它存储类关键字）。

## Reference
[typedef介绍_liitdar的博客-CSDN博客_typedef](https://blog.csdn.net/liitdar/article/details/80069638)

[关于typedef的用法总结_IT民工-CSDN博客_typedef](https://blog.csdn.net/wangqiulin123456/article/details/8284939)