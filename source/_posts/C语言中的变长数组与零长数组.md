---
title: C语言中的变长数组与零长数组
date: 2022-02-11 21:09:35
updated:
tags: [C]
categories:
---

## 变长数组

想必很多学习C语言的人都会在书上看到，**数组在初始化时必须要确定长度（维度）**，也就是说定义数组时，维度一定要用常量。但是在编程中很多人肯定发现了，及时像下面这样写，编译器也不会报错。
```c
int n;             
int array[n];    
```

这是怎么回事？难道以前我学的是错的吗？当然不是。最官方的解释应该是 C 语言的规范和编译器的规范说明了。

- 在 ISO/IEC9899 标准的 [6.7.5.2 Array declarators](http://busybox.net/~landley/c99-draft.html#6.7.5.2) 中明确说明了数组的长度可以为变量的，称为变长数组（VLA，variable length array）。（注：这里的变长指的是数组的长度是在运行时才能决定，但一旦决定在数组的生命周期内就不会再变。）
- 在 GCC 标准规范的 [6.19 Arrays of Variable Length](http://gcc.gnu.org/onlinedocs/gcc/Variable-Length.html) 中指出，作为编译器扩展，GCC 在 C90 模式和 C++ 编译器下遵守 ISO C99 关于变长数组的规范。

原来这种语法确实是 C 语言规范，GCC 非常完美的支持了 ISO C99。但是在 C99 之前的 C 语言中，变长数组的语法是不存在的。

这种变长数组有什么好处呢？它可以实现与`alloca`函数一样的效果，在栈上进行动态的空间分配，并且在函数返回时自动释放内存，无需手动释放。
>`alloca` 函数用来在栈上分配空间，当函数返回时自动释放，无需手动再去释放；

可变数组示例：
所有可变修改 (VM) 类型的声明必须在块范围或函数原型范围内。使用 `static` 或 `extern` 存储类说明符声明的数组对象不能具有可变长度数组 (VLA) 类型。但是，使用静态存储类说明符声明的对象可以具有 `VM` 类型（即，指向 `VLA` 类型的指针）。最后，使用 `VM` 类型声明的所有标识符都必须是普通标识符，因此**不能是结构或联合的成员**。
```c
extern int n;
int A[n];                       // Error - file scope VLA.
extern int (*p2)[n];            // Error - file scope VM.
int B[100];                     // OK - file scope but not VM.

void fvla(int m, int C[m][m])   // OK - VLA with prototype scope.
{
        typedef int VLA[m][m]   // OK - block scope typedef VLA.

        struct tag {
                int (*y)[n];        // Error - y not ordinary identifier.
                int z[n];           // Error - z not ordinary identifier.
        };
        int D[m];                   // OK - auto VLA.
        static int E[m];            // Error - static block scope VLA.
        extern int F[m];            // Error - F has linkage and is VLA.
        int (*s)[m];                // OK - auto pointer to VLA.
        extern int (*r)[m];         // Error - r had linkage and is
                                    // a pointer to VLA.
        static int (*q)[m] = &B;    // OK - q is a static block
                                    // pointer to VLA.
}
```

## 零长数组

GNU/GCC 在标准的 C/C++ 基础上做了有实用性的扩展, 零长度数组（Arrays of Length Zero） 就是其中一个知名的扩展。使用零长数组，把它作为结构体的最后一个元素非常有用:

```C
struct line {
    int length;
    char contents[0];
};

struct line *thisline = (struct line *) malloc (sizeof (struct line) + this_length);
thisline->length = this_length;
```
从上例就可以看出，零长数组在有固定头部的可变对象上非常适用，我们可以根据对象的大小动态地去分配结构体的大小。

在 `Linux` 内核中也有这种应用，例如由于 `PID` 命名空间的存在，每个进程 `PID` 需要映射到所有能看到其的命名空间上，但该进程所在的命名空间在开始并不确定（但至少为 `init` 命名空间），需要在运行是根据 `level` 的值来确定，所以在该结构体后面增加了一个长度为 `1` 的数组（因为至少在一个`init`命名空间上），使得该结构体 `pid` 是个可变长的结构体，在运行时根据进程所处的命名空间的 `level` 来决定 `numbers` 分配多大。（注：虽然不是零长度的数组，但用法是一样的）

```C
struct pid
{
    atomic_t count;
    unsigned int level;
    /* lists of tasks that use this pid */
    struct hlist_head tasks[PIDTYPE_MAX];
    struct rcu_head rcu;
    struct upid numbers[1];
};
```

### 什么0长度数组不占用存储空间

0长度数组与指针实现有什么区别呢, 为什么0长度数组不占用存储空间呢?

其实本质上涉及到的是一个C语言里面的数组和指针的区别问题. char a[1]里面的a和char *b的b相同吗？

《 Programming Abstractions in C》（Roberts, E. S.，机械工业出版社，2004.6）82页里面说。
>“arr is defined to be identical to &arr[0]”.

也就是说，`char a[1]`里面的`a`实际是一个常量，等于`&a[0]`。而`char *b`是有一个实实在在的指针变量`b`存在。 所以，`a=b`是不允许的，而`b=a`是允许的。 

本质上因为数组名它只是一个偏移量， 数组名这个符号本身代 表了一个不可修改的**地址常量** （注意：数组名永远都不会是指针！ ），但对于这个数组的大小，我们可以进行动态分配,对于编译器而言，数组名仅仅是一个符号，它不会占用任何空间，它在结构体中，只是代表了一个偏移量，代表一个不可修改的地址常量！
## References

[alloca 函数用来在栈上分配空间，当函数返回时自动释放，无需手动再去释放](https://www.cnblogs.com/hazir/p/variable_length_array.html)

[C语言0长度数组(可变数组/柔性数组)详解_OSKernelLAB(gatieme)-CSDN博客_柔性数组](https://blog.csdn.net/gatieme/article/details/64131322)

[零长数组（柔性数组、可变数组）的使用_禾仔仔的博客-CSDN博客](https://blog.csdn.net/weixin_43083491/article/details/112632310)

[Zero Length - Using the GNU Compiler Collection (GCC)](https://gcc.gnu.org/onlinedocs/gcc-4.1.1/gcc/Zero-Length.html#Zero-Length)