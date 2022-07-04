---
title: C语言数组/结构体/结构体数组/联合体初始化
date: 2022-06-30 15:30:41
updated:
tags: [C]
categories:
---
## 数组初始化

```C
int arr[6] = { [0]=5, [1]=6, [3] =10, [4]=11 }; 或
int arr[6] = { [0]=5, 6, [3] =10, 11 }; 或
int arr[6] = { [3] =10, 11, [0]=5, 6 }; (指定顺序可变)
均等效于：int arr[6] = {5, 6, 0, 10, 11, 0};
```

Note: 
1. 若在某个指定初始化项目后跟有不至一个值，如`[3]=10,11`。则多出的数值用于对后续的数组元素进行初始化，即数值11用来初始化arr[4]。
2. C数组初始化一个或多个元素后，未初始化的元素将被自动地初始化为0或NULL(针对指针变量)。未经过任何初始化的数组，所有元素的值都是不确定的。

GNU C还支持`[first … last]=value`(`…`**两侧有空格**)的形式，将该范围内的若干元素初始化为相同值。如：
```c
int arr[]={ [0 ... 3]=1, [4 ... 5]=2, [6 ... 9] =3}; 或
int arr[]={ [0 ... 3]=1, [4 ... 5]=2, [6 ... 8] =3, [9] =3};
均等效于：int arr[10] = {1, 1, 1, 1, 2, 2, 3, 3, 3, 3};
```

## 结构体初始化
对于结构体
```C
struct Structure{ int a; int b; }; 或
struct Structure{ int a, b; };
```
有以下几种初始化方式：
用`.fieldname=指定待初始化成员名`(成员初始化顺序可变)，**推荐使用的方式**，该方式初始化时不必严格按照定义时的顺序，灵活性很高。

```C
struct Structure tStct = {
    .a = 1,
    .b = 2
};
```
用`fieldname:指定待初始化成员名`(成员初始化顺序可变)，GCC 2.5已废除，但仍接受
```C
struct Structure tStct = {
    a : 1,
    b : 2
};
```
用初始化列表初始化
```C
struct Structure tStct = { 1, 2 };
```


## 结构体数组初始化
方法一：
```C
struct Structure ptStct[10] = {
     [2].b = 0x2B, [2].a = 0x2A,
     [0].a = 0x0A };
```

方法二：该方法可以用于清除结构体。
```C
memset(ptStct, 0, sizeof(struct Structure) * 10);
```

## 联合体初始化
可用`.fieldname`(或已废弃的`fieldname:`)指示符来指定使用联合体的哪个元素，如：
```C
union UnionT { int i; double d; };
union UnionT tUnion = { .d = 4 };
```
