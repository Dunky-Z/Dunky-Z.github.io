---
title: C语言可变参数
date: 2021-10-12 11:21:49
tags: [C,C++]
---
学习过程中查看了`printf()`源码，遇到了这样的函数定义，
```c
void printf(char *fmt, ...){
    char buf[256];
    va_list args;

    memset(buf, 0, sizeof(buf));
    va_start(args, fmt);
    vsprint(buf, fmt, args);
    va_end(args);
    
    puts(buf);
}
```
参数中的三个点号，就是C语言中可变参数的标识。这样的函数称为可变参数函数。这种函数需要固定数量的**强制参数**（mandatory argument），后面是**数量可变的可选参数**（optional argument）。

这种函数**必须至少有一个**强制参数。可选参数的类型可以变化。可选参数的数量由强制参数的值决定，或由用来定义可选参数列表的特殊值决定。

C 语言中最常用的可变参数函数例子是` printf（）`和 `scanf（）`。这两个函数都有一个强制参数，即格式化字符串。格式化字符串中的转换修饰符决定了可选参数的数量和类型。

可变参数函数要获取可选参数时，必须通过一个类型为 `va_list` 的对象，它包含了参数信息。这种类型的对象也称为参数指针（argument pointer），它包含了栈中至少一个参数的位置。可以使用这个参数指针从一个可选参数移动到下一个可选参数，由此，函数就可以获取所有的可选参数。`va_list` 类型被定义在头文件 `stdarg.h` 中。

当编写支持参数数量可变的函数时，必须用 `va_list` 类型定义参数指针，以获取可选参数。在下面的讨论中，`va_list` 对象被命名为 `argptr`。可以用 `4 `个宏来处理该参数指针，这些宏都定义在头文件 `stdarg.h` 中：
- 宏 `va_start` 使用第一个可选参数的位置来初始化 `argptr` 参数指针。该宏的第二个参数必须是该函数最后一个有名称参数的名称。必须先调用该宏，才可以开始使用可选参数。
    ```c
    void va_start(va_list argptr, lastparam);
    ```

- 展开宏 `va_arg` 会得到当前 `argptr` 所引用的可选参数，也会将 `argptr` 移动到列表中的下一个参数。宏 `va_arg` 的第二个参数是刚刚被读入的参数的类型。
    ```c
    type va_arg(va_list argptr, type);
    ```
- 当不再需要使用参数指针时，必须调用宏 `va_end`。如果想使用宏 `va_start` 或者宏 `va_copy` 来重新初始化一个之前用过的参数指针，也必须先调用宏 `va_end`。`va_end`被定义为空.它只是为实现与va_start配对(实现代码对称和"代码自注释"(根据代码就能知道功能，不需要额外注释)功能)
    ```c
    void va_end(va_list argptr);
    ```

- 宏 `va_copy` 使用当前的` src `值来初始化参数指针 `dest`。然后就可以使用 `dest `中的备份获取可选参数列表，从` src` 所引用的位置开始。
    ```c
    void va_copy(va_list dest, va_list src);
    ```

```c
// 函数add() 计算可选参数之和
// 参数：第一个强制参数指定了可选参数的数量，可选参数为double类型
// 返回值：和值，double类型
double add( int n, ... )
{
  int i = 0;
  double sum = 0.0;
  va_list argptr;
  va_start( argptr, n );             // 初始化argptr
  for ( i = 0; i < n; ++i )          // 对每个可选参数，读取类型为double的参数，
    sum += va_arg( argptr, double ); // 然后累加到sum中
  va_end( argptr );
  return sum;
}
```
简易`printf`函数

```c
#include <stdarg.h>
/* minprintf: minimal printf with variable arqument list */
void minprintf(char *fmt, ...)

{
    GPIO
    va_list ap; /* points to each unnamed arq in turn */
    char *p, *sval;
    int ival;
    double dval;
    va_start(ap, fmt); /* make ap point to 1st unnamed arg */
    for (p = fmt; *p; p++) {
        if (*p != '%') {
            putchar(*p);
            continue;
        }
    }
    switch (*++p) {
        case 'd':
         ival = va_arg(ap, int);

            printf("%d", ival);
            break;
        case 'f':
            dval = va_arg(ap, double);
            printf("%f", dval);
            break;
        case 's':
            for (sval = va_arq(ap, char *); *sval; sval++)
                putchar(*sval);
            break;
        default:
            putchar(*p);
            break;
    }
    va_end(ap); /* clean up when done */
}
```