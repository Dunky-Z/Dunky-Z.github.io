---
title: C语言__attribute__使用
date: 2022-01-08 15:40:51
updated:
tags:
categories:
---

## 简介

`__attribute__` 其实是个编译器指令，告诉编译器声明的特性，或者让编译器进行更多的错误检查和高级优化。

`__attribute__` 可以设置[函数属性（Function Attribute）](https://gcc.gnu.org/onlinedocs/gcc-4.7.1/gcc/Function-Attributes.html#Function-Attributes)、[变量属性（Variable Attribute）](https://gcc.gnu.org/onlinedocs/gcc-4.7.1/gcc/Variable-Attributes.html#Variable-Attributes)和[类型属性（Type Attribute）](https://gcc.gnu.org/onlinedocs/gcc-4.7.1/gcc/Type-Attributes.html#Type-Attributes)。每一类都包含数十种属性，本文不会逐一解释，只抛砖引玉，完整属性可以查看链接中的官方文档。

一个属性说明符的形式是`__attribute__ ((attribute-list))`。一个属性列表是一个可能为空的逗号分隔的属性序列，其中每个属性都是以下的一个。
- 属性为空。空属性会被忽略。
- 一个单词（可能是未使用的标识符，也可能是 const 等保留字）。
- 一个单词，后面跟着括号中的属性参数。这些参数采用以下形式之一：
  - 一个标识符。例如，`mode`属性使用这种形式。
  - 一个标识符，后跟一个逗号和一个以逗号分隔的非空表达式列表。例如，`format`属性使用这种形式。
  - 一个可能是空的逗号分隔的表达式列表。例如，`format_arg`属性使用这种形式，该列表是一个单一的整数常量表达式，而`alias`属性也使用这种形式，该列表是一个单一的字符串常量。

## 使用方法

### 函数属性
#### alias
该属性可以设置函数的别名。

```c
void __f() { printf("__attribute__ test\n"); };
void f() __attribute__((weak, alias("__f")));
int main() 
{
  f();

  return 0;
}
/*--- 输出 ---*/ 
//__attribute__ test
```
函数`f()`的别名为`__f()`，调用`f()`即调用`__f()`。

#### alloc_size
`alloc_size`属性用来告诉编译器，函数的返回值指向内存，其中的大小由一个或两个函数参数给出。GCC使用这些信息来提高`__builtin_object_size`的正确性。

`alloc_size`后面可以跟一到二个参数，`alloc_size` 后面跟的参数是指定使用函数的第几个参数。
- 函数的参数的个数只有一个，那么alloc_size的参数只能是1。通过`__builtin_object_size` 获取的值 就是传入的参数值。如图，我们给函数`my_malloc` 传入的值是`100` ，那么我们通过`__builtin_object_size` 获取的值就是`100`。

- 函数的参数的个数多余两个，那么`alloc_size` 的最多可以指定两个参数。传入两个参数，`__builtin_object_size`的值是这两个参数的乘积。传入一个参数，`__builtin_object_size `的值就是这个参数的值。如图，`my_callocd`函数指定的参数是`alloc_size(2,3)`，通过`__builtin_object_size`获取的值就是`my_callocd`传入的第二和三个参数的乘积（2*3=6）。

```c
void *my_calloc(int a) __attribute__((alloc_size(1)));
void *my_realloc(int a, int b, int c) __attribute__((alloc_size(2, 3)));
void *my_calloc(int a) { return NULL; }
void *my_realloc(int a, int b, int c) { return NULL; }

int main() {
  void *const p = my_calloc(100);
  printf("size : %ld\n", __builtin_object_size(p, 0));

  void *const a = my_realloc(1, 2, 3);
  printf("size : %ld\n", __builtin_object_size(a, 1));

  return 0;
}
/*--- 输出 ---*/ 
//100
//6
```
#### constructor (priority) / destructor (priority)

`constructor`属性使该函数在执行进入`main()`之前被自动调用。同样地，`destructor`属性使函数在`main()`完成后或`exit()`被调用后被自动调用。具有这些属性的函数对于初始化将在程序执行过程中隐含使用的数据非常有用。


`constructor` 和 `+load` 都是在 main 函数执行前调用，但 +load 比 constructor 更加早一丢丢，因为 dyld（动态链接器，程序的最初起点）在加载 image（可以理解成 Mach-O 文件）时会先通知 objc runtime 去加载其中所有的类，每加载一个类时，它的 +load 随之调用，全部加载完成后，dyld 才会调用这个 image 中所有的 constructor 方法。

若有多个 `constructor` 且想控制优先级的话，可以写成 `attribute((constructor(101)))`，里面的数字越小优先级越高，`1 ~ 100` 为系统保留。
### 变量属性
#### cleanup
该属性在变量作用域结束时，调用指定的一个函数。这个属性只能应用于自动函数范围的变量；它不能应用于参数或具有静态存储期限的变量。该函数必须接受一个参数，一个指向与变量兼容的类型的指针。函数的返回值（如果有的话）被忽略。
```c
#include <stdlib.h>
#include <string.h>

void test_cleanup(char **str) {
  printf("after cleanup: %s\n", *str);
  free(*str);
}

int main(int argc, char **argv) {

  char *str __attribute__((__cleanup__(test_cleanup))) = NULL;
  str = (char *)malloc((sizeof(char)) * 100);
  strcpy(str, "test");
  printf("before cleanup : %s\n", str);
  return 0;
}
/*--- 输出 ---*/ 
//before cleanup : test
//after cleanup: test
```
作用域结束包括大括号结束、`return`、`goto`、`break`、`exception`等各种情况。在上面的实验中，`main`函数返回标志变量`str`作用域结束，所以最后才打印`after cleanup: test`。
### 类型属性

#### aligned (alignment)
这个属性指定了函数的最小对齐方式，以字节为单位。对齐的大小只能增加，不能减小。

```c
#include <stdio.h>

struct stu {
  char sex;
  int length;
  char name[2];
  char value[15];
} __attribute__((aligned(1)));
struct stu my_stu;

int main() {
  printf("%d \n", sizeof(my_stu));
  printf("%p %p,%p,%p \n", &my_stu, &my_stu.length, &my_stu.name,
         &my_stu.value);

  return 0;
}
/*---  __attribute__((aligned(1)));输出 ---*/ 
//28 
//0x55af2ba25020 0x55af2ba25024,0x55af2ba25028,0x55af2ba2502a
/*---  __attribute__((aligned(4)));输出 ---*/ 
//28 
//0x556fbce54020 0x556fbce54024,0x556fbce54028,0x556fbce5402a 
/*---  __attribute__((aligned(8)));输出 ---*/ 
//32 
//0x5646e130e040 0x5646e130e044,0x5646e130e048,0x5646e130e04a
```
由以上代码实验结果发现，默认对齐代下为4字节，小于这个值就被忽略，大于4字节才生效。




## Refernece
[__attribute__ 机制使用 - 简书](https://www.jianshu.com/p/e2dfccc32c80)
[C语言复杂声明解析_wangweixaut061的专栏-CSDN博客_c语言复杂声明](https://blog.csdn.net/wangweixaut061/article/details/6549768)
[__attribute__ 你知多少？](http://www.360doc.com/content/15/0305/15/14530056_452758913.shtml)