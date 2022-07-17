---
title: C语言getopt()函数的用法
date: 2022-07-16 22:42:03
updated:
tags: [C, Linux]
categories:
---

在做[CSAPP_LAB-Cache Lab](https://dunky-z.github.io/2022/07/11/CSAPP-LAB-Cache-Lab/)时，实验要求对输入参数进行处理，如程序`csim`执行需要4个参数：
```bash
./csim -s 4 -E 6 -b 4 -t <tracefile>
```
原先想通过字符串解析，一个个处理，但是看到了其他参考代码后发现了一个更简单的方法，可以通过`getopt()`函数来解析参数。

函数的功能： 解析命令行参数。
头文件 `#include <unistd.h>`

在学习函数前需要了解与该函数相关的四个变量：
- `int opterr`：控制是否输出错误；
如果此变量的值非零，则 `getopt` 在遇到未知选项字符或缺少必需参数的选项时将错误消息打印到标准错误流(终端)。该值默认为非零。如果将此变量设置为零，`getopt` 不会打印任何消息，但仍会返回问号`?`提示错误。

- `int optopt`：保存未知的选项；
当 `getopt` 遇到未知选项字符或缺少必需参数的选项时，它将该选项字符存储在此变量中。

- `int optind`：指向下一个要处理的参数；
此变量由 `getopt` 设置为要处理的 `argv` 数组的下一个元素的索引。一旦 `getopt` 找到所有选项参数，就可以使用此变量来确定其余非选项参数的开始位置。该变量的初始值为 1。

-  `char * optarg`：保存选项参数；
对于那些接受参数的选项，此变量由 `getopt` 设置为指向选项参数的值。


函数原型：
```c
int getopt(int argc, char * const argv[], const char * options);
```
参数解析：
- 参数`argc` 和`argv` 是由`main()`传递的参数个数和内容。
- `options` 参数是一个字符串，它指定对该程序有效的选项字符。此字符串中的选项字符后面可以跟一个冒号（`:`），表示它需要一个**必需的参数**，这个参数可以与选项连写也可以空格分开，如`-a13 or  -a 13`。如果选项字符后跟两个冒号（`::`），则其参数是**可选的**，如果有参数，那么参数不能与选项分割，如只能写成`-a13`而不能写成`-a 13`；这是一个 GNU 扩展。

实例：

下面是一个示例，展示了通常如何使用 `getopt`。需要注意的关键点是：
- 通常，`getopt` 在循环中被调用。当 `getopt` 返回 `-1` 表示没有更多选项存在时，循环终止。
- `switch` 语句用于调度 `getopt` 的返回值。在典型使用中，每种情况只设置一个稍后在程序中使用的变量。
- 第二个循环用于处理剩余的非选项参数。
```C
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int
main (int argc, char **argv)
{
  int aflag = 0;
  int bflag = 0;
  char *cvalue = NULL;
  int index;
  int c;

  opterr = 0;

  while ((c = getopt (argc, argv, "abc:")) != -1)
    switch (c)
      {
      case 'a':
        aflag = 1;
        break;
      case 'b':
        bflag = 1;
        break;
      case 'c':
        cvalue = optarg;
        break;
      case '?':
        if (optopt == 'c')
          fprintf (stderr, "Option -%c requires an argument.\n", optopt);
        else if (isprint (optopt))
          fprintf (stderr, "Unknown option `-%c'.\n", optopt);
        else
          fprintf (stderr,
                   "Unknown option character `\\x%x'.\n",
                   optopt);
        return 1;
      default:
        abort ();
      }

  printf ("aflag = %d, bflag = %d, cvalue = %s\n",
          aflag, bflag, cvalue);

  for (index = optind; index < argc; index++)
    printf ("Non-option argument %s\n", argv[index]);
  return 0;
}
```
以下是一些示例，展示了该程序使用不同的参数组合打印的内容：
```C
% testopt
aflag = 0, bflag = 0, cvalue = (null)

// 选项可以用空格分割
% testopt -a -b
aflag = 1, bflag = 1, cvalue = (null)

// 也可以连写
% testopt -ab
aflag = 1, bflag = 1, cvalue = (null)

// 必选参数，可以用空格分割
% testopt -c foo
aflag = 0, bflag = 0, cvalue = foo

// 必选参数，可以连写
% testopt -cfoo
aflag = 0, bflag = 0, cvalue = foo

// 没有对应的选项
% testopt arg1
aflag = 0, bflag = 0, cvalue = (null)
Non-option argument arg1

// -a选项没有需要处理的参数，所以arg1无法处理
% testopt -a arg1
aflag = 1, bflag = 0, cvalue = (null)
Non-option argument arg1

% testopt -c foo arg1
aflag = 0, bflag = 0, cvalue = foo
Non-option argument arg1

% testopt -a -- -b
aflag = 1, bflag = 0, cvalue = (null)
Non-option argument -b

% testopt -a -
aflag = 1, bflag = 0, cvalue = (null)
Non-option argument -
```


## 参考资料

[原来命令行参数处理可以这么写-getopt？_huangxiaohu_coder的博客-CSDN博客](https://blog.csdn.net/huangxiaohu_coder/article/details/7475156)
[Linux下getopt()函数的简单使用 - 青儿哥哥 - 博客园](https://www.cnblogs.com/qingergege/p/5914218.html)
[Using Getopt (The GNU C Library)](http://www.gnu.org/software/libc/manual/html_node/Using-Getopt.html)