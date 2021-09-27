---
title: 解决expected 'char * const*' but argument is of type 'char **'
date: 2021-09-08 19:07:27
tags: [C,Bug]
---
在使用`exec`系列函数时，`execle`，`execv`，`execvp`三个函数，都可以使用`char *arg[]`传入启动参数。以下面的程序为例，
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void)
{
    int ret;
    char *argv[] = {"ls","-l",NULL};
    ret = execvp("ls",argv);
    if(ret == -1)
        perror("execl error");
    return 0;
}
```
编译时就会出现一下，警告，
```
expected 'char * const*' but argument is of type 'const char **'
```

因为项目中不允许警告产生，所以编译选项是`-Werror`，所有警告都会被升级成错误。编译时就会产生如下提示，

```shell
ccl : all warnings being treated as errors
```

如果是平时练习，改一下编译选项，把这个警告忽略就行，但是现在只能解决。

出现这个问题就是因为定义数组时`char *argv[]`类型是`char **`。但是`execvp()`函数签名是`execvp(const char *file, char *const argv[]);`第二个参数的类型是`char * const *`。

本以为直接将变量定义更改成`char * const argv[]`就行了，但是它等价于`const char **`，所以仍然不能和函数签名匹配。

实在没办法只能改成如下：
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void)
{
    printf("entering main process---\n");
    int ret;
    char str1[] = "ls";
    char str2[] = "-l";
    char * const argv[] = {str1, str2, NULL};
    ret = execvp("ls",argv);
    if(ret == -1)
        perror("execl error");
    printf("exiting main process ----\n");
    return 0;
}
```

或者在将形参`argv`进行强制转换。

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void)
{
    printf("entering main process---\n");
    int ret;
    char const *argv[] = {"ls", "-l", NULL};
    ret = execvp("ls",(char * const *)argv);
    if(ret == -1)
        perror("execl error");
    printf("exiting main process ----\n");
    return 0;
}
```