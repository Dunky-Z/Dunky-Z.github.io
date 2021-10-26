---
title: C语言复杂声明
date: 2021-10-22 11:02:58
tags: [C]
---

C语言常常因为声明的语法问题而受到人们的批评，特别是涉及到函数指针的语法。C语言的语法力图使声明和使用相一致。对于简单的情况， C语言的做法是很有效的，但是，如果情况比较复杂，则容易让人混淆，原因在于， C语言的声明不能从左至右阅读，而且使用了太多的圆括号。
在C中，声明的形式为（dcl是declaration的简写）：
```
dcl: optional *'s direct-dcl（含有可选"*"的direct-dcl）
direct-dcl name
            (dcl)
            direct-dcl()
            direct-dcl[optional size] 
```

简而言之,声明符`dc1`(可以理解成间接声明)就是前面可能带有多个`*`的`direcr-dclo`。` direct-dcl`可以是`name`、由一对圆括号括起来的`dcl`、后面跟有一对圆括号的`direct-dcl`、后面跟有用方括号括起来的表示可选长度的`direc-dcl`。

根据该规则进行逆向解析，就可以得到正确的声明。简化一下：`TypeName Declarator;`其中，`Declarator`就是声明中的那个`name`。当你遇到任何你不能理解的声明时，这个法则就是救命稻草。最简单的例子：
```c
int aInt;
```
这里，`int`是`TypeName`，`aInt`是`Declarator`。

再说明一下结合紧密度。在声或定义变量时，可以使用一些修饰比如`*`，`[]`，`()`等。`()`（非函数声明中的`()`）具有最高的紧密度，其次才是函数和数组的`()`和`[]`。

没有`*`的声明称为直接声明（`direct-dcl`），而有`*`称为声明（`dcl`）。直接声明要比声明结合的紧。分解声明时，先读出结合紧的。在这里，我把`direct-dcl`称为更紧的结合，它比`dcl`结合得紧。

最后，需要你用英语来读出这个声明。对于`[]`，应该读成`array of`。

对于复杂的定义，可以将其分解。比如`T (*p)()`可以分解成`T D1()`，`D1`读作：*`function returning T`*。其中`D1`是`*p`。那么该声明应该读成：*`p is a poniter to`*。二者合在一起，就变成了 *`p is a pointer to function returning T`*，即：`p`是指向返回`T`类对象的函数的指针。


再看一个稍微复杂的示例：
```c
T (*pfa[])();
```
根据`dcl`和`direct-dcl`，可以分解成`T1 D1`（因为结合紧密度），`T1`也就是`T ()`，那么应该读作：
*`D1 is function returning T`*。

`D1`又可以写成`T2 D2`，其中`T2`是`T1 []`，可以分解成`T1 D2[]`，读作：*`array of D2 function returning T`*。

`D2`是指针，读作：*`pointers to`*。那么整个 *`T (*pfa[])()`* 应该读作：*`pfa is an array of pointers to function returning T`*，即：`pfa`是个存放指向返回T类对象函数的指针的数组。

换种方式看，在这个例子中，`pfa`是名字，`T(*[])()`是类型。将`(*pfa[])`视为一体（`direct-dcl`），称为`D1`，那么可以写成`T D1()`，*`function returning object of T`*。在`D1`中，将`*pfa`视为一体（`dcl`），称为`D2`，那么`*pfa[]`应该是`D2[]`（direct-dcl），`array of D2`。合起来就是 *`array of D2 function returning object of T`*。`D2`是`*pfa`（dcl），替换到前面这句话，结果就是 *`array of pointers to function returning object of T`*。

有了这些说明，可以试着做一下下面的题，看看自己是否真的理解了：


```c
char **argv
    // argv:  pointer to pointer to char
    // 指向char型指针的指针
int (*daytab)[13]
    // daytab:  pointer to array[13] of int
    // 指向int型数组的指针
int *daytab[13]
    // daytab:  array[13] of pointer to int
    // 存放int型指针的数组
void *comp()
    // comp: function returning pointer to void
    // 返回值为指向void型指针的函数
void (*comp)()
    // comp: pointer to function returning void
    // 指向返回值为void型函数的指针
char (*(*x())[])()
    // x: function returning pointer to array[] of
    // pointer to function returning char
    // 返回值为char型的函数
char (*(*x[3])())[5]
    // x: array[3] of pointer to function returning
    // pointer to array[5] of char
```

在C++中，规则比C要复杂一些。不过，基本思想保持不变，按照C的原则来理解复杂的声明，基本上就能满足要求了。没有在这里列出C++的规则一方面是因为太广，不能覆盖全；另一个原因就是，按照C的规则来就足够了，毕竟C++要与C兼容。